const db = require('../config/db')
const txService = require('./transactionService')

// Tính ngày đến hạn kế tiếp dựa trên tần suất
const computeNextDueDate = (currentDueDate, frequency) => {
  const d = new Date(currentDueDate)
  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1)
      break
    case 'weekly':
      d.setDate(d.getDate() + 7)
      break
    case 'monthly':
      d.setMonth(d.getMonth() + 1)
      break
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1)
      break
    default:
      d.setMonth(d.getMonth() + 1)
  }
  return d.toISOString().slice(0, 10)
}

// ============================================================
// GET — Danh sách giao dịch định kỳ
// ============================================================
const getRecurring = async (userId) => {
  const query = `
    SELECT
      r.id,
      r.user_id,
      r.wallet_id,
      r.category_id,
      r.type,
      r.amount::numeric AS amount,
      r.frequency,
      r.note,
      r.next_due_date,
      r.last_executed_at,
      r.is_active,
      r.created_at,
      w.name AS wallet_name,
      w.type AS wallet_type,
      c.name AS category_name,
      c.icon AS category_icon
    FROM recurring_transactions r
    JOIN wallets w ON r.wallet_id = w.id
    JOIN categories c ON r.category_id = c.id
    WHERE r.user_id = $1
    ORDER BY r.is_active DESC, r.next_due_date ASC
  `

  const result = await db.query(query, [userId])
  const today = new Date().toISOString().slice(0, 10)

  return result.rows.map((r) => {
    const isDue = r.is_active && r.next_due_date <= today
    return {
      ...r,
      amount: parseFloat(r.amount),
      is_due: isDue,
    }
  })
}

// ============================================================
// CREATE — Tạo giao dịch định kỳ mới
// ============================================================
const createRecurring = async (userId, data) => {
  const {
    wallet_id,
    category_id,
    type,
    amount,
    frequency = 'monthly',
    note,
    next_due_date,
  } = data

  const numAmount = parseFloat(amount)
  if (!wallet_id || !category_id || !type || !amount) {
    const err = new Error('Vui lòng điền đầy đủ ví, danh mục, loại và số tiền')
    err.statusCode = 400
    throw err
  }

  if (isNaN(numAmount) || numAmount <= 0) {
    const err = new Error('Số tiền phải lớn hơn 0')
    err.statusCode = 400
    throw err
  }

  const validFrequencies = ['daily', 'weekly', 'monthly', 'yearly']
  if (!validFrequencies.includes(frequency)) {
    const err = new Error('Tần suất định kỳ không hợp lệ')
    err.statusCode = 400
    throw err
  }

  // Kiểm tra quyền sở hữu ví
  const walletCheck = await db.query(
    'SELECT id, name FROM wallets WHERE id = $1 AND user_id = $2',
    [wallet_id, userId]
  )
  if (walletCheck.rows.length === 0) {
    const err = new Error('Ví không tồn tại hoặc bạn không có quyền truy cập')
    err.statusCode = 404
    throw err
  }

  const insertQuery = `
    INSERT INTO recurring_transactions (
      user_id, wallet_id, category_id, type, amount, frequency, note, next_due_date
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `
  const result = await db.query(insertQuery, [
    userId,
    wallet_id,
    category_id,
    type,
    numAmount,
    frequency,
    note || null,
    next_due_date || new Date().toISOString().slice(0, 10),
  ])

  return result.rows[0]
}

// ============================================================
// TOGGLE — Bật / Tắt trạng thái tự động
// ============================================================
const toggleRecurring = async (userId, id) => {
  const result = await db.query(
    `UPDATE recurring_transactions
     SET is_active = NOT is_active
     WHERE id = $1 AND user_id = $2
     RETURNING id, is_active`,
    [id, userId]
  )

  if (result.rowCount === 0) {
    const err = new Error('Không tìm thấy giao dịch định kỳ')
    err.statusCode = 404
    throw err
  }

  return result.rows[0]
}

// ============================================================
// EXECUTE — Ghi nhận giao dịch định kỳ thành giao dịch thực tế
// ============================================================
const executeRecurring = async (userId, id) => {
  const check = await db.query(
    'SELECT * FROM recurring_transactions WHERE id = $1 AND user_id = $2',
    [id, userId]
  )
  if (check.rows.length === 0) {
    const err = new Error('Không tìm thấy giao dịch định kỳ')
    err.statusCode = 404
    throw err
  }

  const rec = check.rows[0]

  // 1. Dùng transactionService để ghi nhận giao dịch thực tế và tự động cập nhật số dư ví nguyên tử
  const newTx = await txService.createTransaction(userId, {
    wallet_id: rec.wallet_id,
    category_id: rec.category_id,
    type: rec.type,
    amount: rec.amount,
    note: rec.note ? `[Định kỳ] ${rec.note}` : '[Định kỳ]',
    transaction_date: new Date(),
  })

  // 2. Cập nhật ngày đến hạn kế tiếp và thời gian thực hiện gần nhất
  const nextDate = computeNextDueDate(rec.next_due_date, rec.frequency)
  await db.query(
    `UPDATE recurring_transactions
     SET next_due_date = $1, last_executed_at = NOW()
     WHERE id = $2 AND user_id = $3`,
    [nextDate, id, userId]
  )

  return {
    message: 'Đã ghi nhận giao dịch định kỳ thành công',
    transaction: newTx,
    next_due_date: nextDate,
  }
}

// ============================================================
// DELETE — Xóa mẫu giao dịch định kỳ
// ============================================================
const deleteRecurring = async (userId, id) => {
  const result = await db.query(
    'DELETE FROM recurring_transactions WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  )

  if (result.rowCount === 0) {
    const err = new Error('Không tìm thấy giao dịch định kỳ hoặc bạn không có quyền xóa')
    err.statusCode = 404
    throw err
  }

  return { message: 'Đã xóa giao dịch định kỳ thành công', id }
}

module.exports = {
  getRecurring,
  createRecurring,
  toggleRecurring,
  executeRecurring,
  deleteRecurring,
}
