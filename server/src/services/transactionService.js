const db = require('../config/db')

// ============================================================
// GET — Lấy danh sách giao dịch với filter + phân trang
// ============================================================
const getTransactions = async (userId, filters = {}) => {
  const {
    wallet_id,
    category_id,
    type,
    start_date,
    end_date,
    page  = 1,
    limit = 20,
  } = filters

  // ── Build WHERE clause động ──────────────────────────────
  // Kỹ thuật: dùng mảng conditions + params, tăng index $N dần
  // Luôn bắt đầu với user_id để đảm bảo data isolation
  const conditions = ['t.user_id = $1']
  const params     = [userId]
  let   idx        = 2  // Index của placeholder tiếp theo

  if (wallet_id) {
    conditions.push(`t.wallet_id = $${idx}`)
    params.push(wallet_id)
    idx++
  }
  if (category_id) {
    conditions.push(`t.category_id = $${idx}`)
    params.push(category_id)
    idx++
  }
  if (type) {
    conditions.push(`t.type = $${idx}`)
    params.push(type)
    idx++
  }
  if (start_date) {
    conditions.push(`t.transaction_date >= $${idx}`)
    params.push(start_date)
    idx++
  }
  if (end_date) {
    // Lấy đến cuối ngày end_date bằng cách thêm 1 ngày
    conditions.push(`t.transaction_date < $${idx}::date + interval '1 day'`)
    params.push(end_date)
    idx++
  }

  const whereClause = conditions.join(' AND ')
  const offset      = (parseInt(page) - 1) * parseInt(limit)

  // ── Query chính: JOIN lấy thêm thông tin category và wallet ─
  // JOIN giúp lấy category_name, category_icon, wallet_name trong 1 lần truy vấn
  // thay vì phải query nhiều lần
  const dataQuery = `
    SELECT
      t.id, t.type, t.amount, t.note, t.transaction_date, t.created_at,
      t.wallet_id,   w.name  AS wallet_name,
      t.category_id, c.name  AS category_name, c.icon AS category_icon
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    JOIN wallets    w ON t.wallet_id    = w.id
    WHERE ${whereClause}
    ORDER BY t.transaction_date DESC, t.created_at DESC
    LIMIT $${idx} OFFSET $${idx + 1}
  `
  params.push(parseInt(limit), offset)

  // ── Query đếm tổng số record (để trả về pagination metadata) ─
  // Dùng lại cùng conditions nhưng không cần LIMIT/OFFSET
  const countParams = params.slice(0, idx - 1)   // loại bỏ limit và offset
  const countQuery  = `
    SELECT COUNT(*) AS total
    FROM transactions t
    WHERE ${whereClause}
  `

  const [dataResult, countResult] = await Promise.all([
    db.query(dataQuery, params),
    db.query(countQuery, countParams),
  ])

  const total      = parseInt(countResult.rows[0].total)
  const totalPages = Math.ceil(total / parseInt(limit))

  return {
    data: dataResult.rows,
    pagination: {
      total,
      totalPages,
      currentPage: parseInt(page),
      limit: parseInt(limit),
      hasNext: parseInt(page) < totalPages,
      hasPrev: parseInt(page) > 1,
    },
  }
}

// ============================================================
// CREATE — Thêm giao dịch + cập nhật số dư ví (Atomic)
// ============================================================
const createTransaction = async (userId, data) => {
  const { wallet_id, category_id, type, amount, note, transaction_date } = data

  // Dùng pool.connect() để có được 1 connection dùng riêng cho transaction
  const client = await db.pool.connect()
  try {
    await client.query('BEGIN')  // Bắt đầu database transaction

    // 1. Kiểm tra ví tồn tại và thuộc về user
    const walletCheck = await client.query(
      'SELECT id, balance FROM wallets WHERE id = $1 AND user_id = $2',
      [wallet_id, userId]
    )
    if (walletCheck.rows.length === 0) {
      const err = new Error('Ví không tồn tại hoặc bạn không có quyền truy cập')
      err.statusCode = 404
      throw err
    }

    // 2. INSERT giao dịch
    const txResult = await client.query(
      `INSERT INTO transactions (user_id, wallet_id, category_id, type, amount, note, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, type, amount, note, transaction_date, wallet_id, category_id`,
      [userId, wallet_id, category_id, type, amount, note, transaction_date || new Date()]
    )

    // 3. Cập nhật số dư ví
    // income → cộng tiền; expense → trừ tiền
    const delta = type === 'income' ? parseFloat(amount) : -parseFloat(amount)
    await client.query(
      'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
      [delta, wallet_id]
    )

    await client.query('COMMIT')  // Lưu tất cả, chỉ chạy khi cả 2 bước thành công
    return txResult.rows[0]

  } catch (err) {
    await client.query('ROLLBACK')  // Hủy tất cả nếu có bất kỳ lỗi nào
    throw err
  } finally {
    client.release()  // Trả connection về pool — QUAN TRỌNG: không có cái này → memory leak
  }
}

// ============================================================
// UPDATE — Sửa giao dịch + điều chỉnh lại số dư ví
// ============================================================
const updateTransaction = async (userId, txId, data) => {
  const { category_id, type, amount, note, transaction_date } = data
  const client = await db.pool.connect()

  try {
    await client.query('BEGIN')

    // 1. Lấy giao dịch cũ để tính chênh lệch số dư
    const oldTx = await client.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [txId, userId]
    )
    if (oldTx.rows.length === 0) {
      const err = new Error('Giao dịch không tồn tại')
      err.statusCode = 404
      throw err
    }
    const old = oldTx.rows[0]

    // 2. Tính delta số dư cần điều chỉnh:
    //    Đảo ngược hiệu quả cũ, rồi áp dụng hiệu quả mới
    //    VD: Cũ = expense 100k → Mới = income 50k
    //    → Reverse: +100k (undo expense)
    //    → Apply:   +50k  (apply income)
    //    → Net delta = +150k
    const oldDelta = old.type === 'income' ? -parseFloat(old.amount) : parseFloat(old.amount)
    const newType  = type   || old.type
    const newAmt   = amount || old.amount
    const newDelta = newType === 'income' ? parseFloat(newAmt) : -parseFloat(newAmt)
    const netDelta = oldDelta + newDelta

    // 3. UPDATE giao dịch
    const result = await client.query(
      `UPDATE transactions
       SET category_id      = COALESCE($1, category_id),
           type             = COALESCE($2, type),
           amount           = COALESCE($3, amount),
           note             = COALESCE($4, note),
           transaction_date = COALESCE($5, transaction_date)
       WHERE id = $6 AND user_id = $7
       RETURNING id, type, amount, note, transaction_date, wallet_id, category_id`,
      [category_id, type, amount, note, transaction_date, txId, userId]
    )

    // 4. Cập nhật số dư ví
    await client.query(
      'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
      [netDelta, old.wallet_id]
    )

    await client.query('COMMIT')
    return result.rows[0]

  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ============================================================
// DELETE — Xóa giao dịch + hoàn trả số dư ví
// ============================================================
const deleteTransaction = async (userId, txId) => {
  const client = await db.pool.connect()

  try {
    await client.query('BEGIN')

    // 1. Lấy giao dịch trước khi xóa (cần để biết phải hoàn trả bao nhiêu)
    const existing = await client.query(
      'SELECT * FROM transactions WHERE id = $1 AND user_id = $2',
      [txId, userId]
    )
    if (existing.rows.length === 0) {
      const err = new Error('Giao dịch không tồn tại')
      err.statusCode = 404
      throw err
    }
    const tx = existing.rows[0]

    // 2. Xóa giao dịch
    await client.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [txId, userId]
    )

    // 3. Hoàn trả số dư ví (đảo ngược hiệu quả của giao dịch bị xóa)
    const refund = tx.type === 'income' ? -parseFloat(tx.amount) : parseFloat(tx.amount)
    await client.query(
      'UPDATE wallets SET balance = balance + $1 WHERE id = $2',
      [refund, tx.wallet_id]
    )

    await client.query('COMMIT')
    return { message: 'Xóa giao dịch thành công', id: txId }

  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

module.exports = { getTransactions, createTransaction, updateTransaction, deleteTransaction }
