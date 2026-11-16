const db = require('../config/db')

// ============================================================
// GET — Lấy tất cả ví của một user
// ============================================================
const getWalletsByUser = async (userId) => {
  const result = await db.query(
    `SELECT id, name, type, balance, currency, created_at
     FROM wallets
     WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId]
  )
  return result.rows
}

// ============================================================
// CREATE — Tạo ví mới
// ============================================================
const createWallet = async (userId, { name, type, balance = 0, currency = 'VND' }) => {
  // Validate type hợp lệ
  const validTypes = ['cash', 'bank', 'credit']
  if (!validTypes.includes(type)) {
    const error = new Error(`Loại ví không hợp lệ. Chỉ chấp nhận: ${validTypes.join(', ')}`)
    error.statusCode = 400
    throw error
  }

  const result = await db.query(
    `INSERT INTO wallets (user_id, name, type, balance, currency)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, type, balance, currency, created_at`,
    [userId, name, type, balance, currency]
  )
  return result.rows[0]
}

// ============================================================
// UPDATE — Cập nhật thông tin ví
// ============================================================
const updateWallet = async (userId, walletId, { name, type, balance, currency }) => {
  // Luôn kiểm tra ví thuộc về user này không — tránh IDOR attack
  // IDOR = Insecure Direct Object Reference: truy cập tài nguyên của người khác qua ID
  const check = await db.query(
    'SELECT id FROM wallets WHERE id = $1 AND user_id = $2',
    [walletId, userId]
  )
  if (check.rows.length === 0) {
    const error = new Error('Không tìm thấy ví hoặc bạn không có quyền truy cập')
    error.statusCode = 404
    throw error
  }

  // Chỉ cập nhật các trường được gửi lên (partial update)
  // Dùng COALESCE: nếu giá trị mới là NULL thì giữ nguyên giá trị cũ
  const result = await db.query(
    `UPDATE wallets
     SET name     = COALESCE($1, name),
         type     = COALESCE($2, type),
         balance  = COALESCE($3, balance),
         currency = COALESCE($4, currency)
     WHERE id = $5 AND user_id = $6
     RETURNING id, name, type, balance, currency, created_at`,
    [name, type, balance, currency, walletId, userId]
  )
  return result.rows[0]
}

// ============================================================
// DELETE — Xóa ví
// ============================================================
const deleteWallet = async (userId, walletId) => {
  // Luôn kèm user_id để chắc chắn chỉ xóa ví của chính mình
  const result = await db.query(
    'DELETE FROM wallets WHERE id = $1 AND user_id = $2 RETURNING id',
    [walletId, userId]
  )
  if (result.rows.length === 0) {
    const error = new Error('Không tìm thấy ví hoặc bạn không có quyền xóa')
    error.statusCode = 404
    throw error
  }
  return { message: 'Xóa ví thành công', id: walletId }
}

module.exports = { getWalletsByUser, createWallet, updateWallet, deleteWallet }
