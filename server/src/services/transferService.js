const db = require('../config/db')

// ============================================================
// CREATE — Chuyển tiền giữa 2 ví (Atomic DB Transaction)
// ============================================================
const createTransfer = async (userId, data) => {
  const {
    from_wallet_id,
    to_wallet_id,
    amount,
    fee = 0,
    note,
    transfer_date,
  } = data

  const numAmount = parseFloat(amount)
  const numFee = parseFloat(fee || 0)

  // 1. Validation cơ bản
  if (!from_wallet_id || !to_wallet_id) {
    const err = new Error('Vui lòng chọn cả ví nguồn và ví đích')
    err.statusCode = 400
    throw err
  }

  if (from_wallet_id === to_wallet_id) {
    const err = new Error('Ví nguồn và ví đích không được trùng nhau')
    err.statusCode = 400
    throw err
  }

  if (isNaN(numAmount) || numAmount <= 0) {
    const err = new Error('Số tiền chuyển phải lớn hơn 0')
    err.statusCode = 400
    throw err
  }

  if (isNaN(numFee) || numFee < 0) {
    const err = new Error('Phí chuyển tiền không hợp lệ')
    err.statusCode = 400
    throw err
  }

  const client = await db.pool.connect()

  try {
    await client.query('BEGIN')

    // 2. Kiểm tra quyền sở hữu và lấy số dư 2 ví
    const walletsCheck = await client.query(
      `SELECT id, name, type, balance::numeric
       FROM wallets
       WHERE id IN ($1, $2) AND user_id = $3`,
      [from_wallet_id, to_wallet_id, userId]
    )

    if (walletsCheck.rows.length < 2) {
      const err = new Error('Ví nguồn hoặc ví đích không tồn tại hoặc bạn không có quyền truy cập')
      err.statusCode = 404
      throw err
    }

    const fromWallet = walletsCheck.rows.find((w) => w.id === from_wallet_id)
    const toWallet = walletsCheck.rows.find((w) => w.id === to_wallet_id)

    const totalDeduction = numAmount + numFee

    // 3. Kiểm tra số dư ví nguồn nếu là ví tiền mặt hoặc ngân hàng
    if (fromWallet.type !== 'credit' && parseFloat(fromWallet.balance) < totalDeduction) {
      const err = new Error(
        `Số dư ví "${fromWallet.name}" không đủ để chuyển (cần ${new Intl.NumberFormat('vi-VN').format(totalDeduction)} VNĐ bao gồm cả phí)`
      )
      err.statusCode = 400
      throw err
    }

    // 4. Trừ tiền ví nguồn (tiền chuyển + phí)
    await client.query(
      'UPDATE wallets SET balance = balance - $1 WHERE id = $2 AND user_id = $3',
      [totalDeduction, from_wallet_id, userId]
    )

    // 5. Cộng tiền vào ví đích (chỉ cộng số tiền nhận, không tính phí)
    await client.query(
      'UPDATE wallets SET balance = balance + $1 WHERE id = $2 AND user_id = $3',
      [numAmount, to_wallet_id, userId]
    )

    // 6. Ghi lại lịch sử chuyển tiền
    const insertRes = await client.query(
      `INSERT INTO transfers (
         user_id, from_wallet_id, to_wallet_id, amount, fee, note, transfer_date
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        userId,
        from_wallet_id,
        to_wallet_id,
        numAmount,
        numFee,
        note || null,
        transfer_date || new Date(),
      ]
    )

    await client.query('COMMIT')

    const transfer = insertRes.rows[0]
    return {
      ...transfer,
      from_wallet_name: fromWallet.name,
      from_wallet_type: fromWallet.type,
      to_wallet_name: toWallet.name,
      to_wallet_type: toWallet.type,
    }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

// ============================================================
// GET — Lấy lịch sử chuyển tiền giữa các ví
// ============================================================
const getTransfers = async (userId, { limit = 20, page = 1 } = {}) => {
  const numLimit = parseInt(limit) || 20
  const numPage = parseInt(page) || 1
  const offset = (numPage - 1) * numLimit

  const query = `
    SELECT
      t.id,
      t.from_wallet_id,
      t.to_wallet_id,
      t.amount::numeric AS amount,
      t.fee::numeric AS fee,
      t.note,
      t.transfer_date,
      t.created_at,
      w1.name AS from_wallet_name,
      w1.type AS from_wallet_type,
      w2.name AS to_wallet_name,
      w2.type AS to_wallet_type
    FROM transfers t
    JOIN wallets w1 ON t.from_wallet_id = w1.id
    JOIN wallets w2 ON t.to_wallet_id = w2.id
    WHERE t.user_id = $1
    ORDER BY t.transfer_date DESC, t.created_at DESC
    LIMIT $2 OFFSET $3
  `

  const countQuery = 'SELECT COUNT(*)::int AS total FROM transfers WHERE user_id = $1'

  const [dataRes, countRes] = await Promise.all([
    db.query(query, [userId, numLimit, offset]),
    db.query(countQuery, [userId]),
  ])

  const total = countRes.rows[0].total
  const totalPages = Math.ceil(total / numLimit)

  return {
    data: dataRes.rows.map((r) => ({
      ...r,
      amount: parseFloat(r.amount),
      fee: parseFloat(r.fee),
    })),
    pagination: {
      total,
      totalPages,
      currentPage: numPage,
      limit: numLimit,
      hasNext: numPage < totalPages,
      hasPrev: numPage > 1,
    },
  }
}

// ============================================================
// DELETE — Hủy lượt chuyển tiền & hoàn trả số dư nguyên tử
// ============================================================
const deleteTransfer = async (userId, transferId) => {
  const client = await db.pool.connect()

  try {
    await client.query('BEGIN')

    const check = await client.query(
      'SELECT * FROM transfers WHERE id = $1 AND user_id = $2',
      [transferId, userId]
    )

    if (check.rows.length === 0) {
      const err = new Error('Giao dịch chuyển tiền không tồn tại hoặc bạn không có quyền xóa')
      err.statusCode = 404
      throw err
    }

    const t = check.rows[0]
    const refundToSource = parseFloat(t.amount) + parseFloat(t.fee)
    const deductFromDest = parseFloat(t.amount)

    // Hoàn trả ví nguồn
    await client.query(
      'UPDATE wallets SET balance = balance + $1 WHERE id = $2 AND user_id = $3',
      [refundToSource, t.from_wallet_id, userId]
    )

    // Trừ ví đích
    await client.query(
      'UPDATE wallets SET balance = balance - $1 WHERE id = $2 AND user_id = $3',
      [deductFromDest, t.to_wallet_id, userId]
    )

    // Xóa record
    await client.query('DELETE FROM transfers WHERE id = $1 AND user_id = $2', [transferId, userId])

    await client.query('COMMIT')
    return { message: 'Đã hoàn tác và xóa giao dịch chuyển tiền thành công', id: transferId }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

module.exports = {
  createTransfer,
  getTransfers,
  deleteTransfer,
}
