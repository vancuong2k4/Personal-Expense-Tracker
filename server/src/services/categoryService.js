const db = require('../config/db')

// ============================================================
// GET — Lấy tất cả danh mục (hệ thống + tùy chỉnh của người dùng)
// ============================================================
const getCategories = async (userId) => {
  const result = await db.query(
    `SELECT id, name, type, icon, is_default, user_id
     FROM categories
     WHERE is_default = true OR user_id = $1
     ORDER BY type ASC, is_default DESC, name ASC`,
    [userId]
  )
  return result.rows
}

// ============================================================
// CREATE — Tạo danh mục tùy chỉnh mới
// ============================================================
const createCategory = async (userId, { name, type, icon = '🏷️' }) => {
  if (!name || name.trim().length === 0) {
    const err = new Error('Tên danh mục không được để trống')
    err.statusCode = 400
    throw err
  }

  if (!['income', 'expense'].includes(type)) {
    const err = new Error('Loại danh mục phải là income (thu nhập) hoặc expense (chi tiêu)')
    err.statusCode = 400
    throw err
  }

  // Kiểm tra trùng tên danh mục cùng loại của user
  const check = await db.query(
    `SELECT id FROM categories
     WHERE (user_id = $1 OR is_default = true)
       AND LOWER(name) = LOWER($2)
       AND type = $3`,
    [userId, name.trim(), type]
  )

  if (check.rows.length > 0) {
    const err = new Error(`Danh mục "${name.trim()}" đã tồn tại trong loại ${type === 'income' ? 'Thu nhập' : 'Chi tiêu'}`)
    err.statusCode = 409
    throw err
  }

  const result = await db.query(
    `INSERT INTO categories (user_id, name, type, icon, is_default)
     VALUES ($1, $2, $3, $4, false)
     RETURNING id, name, type, icon, is_default, user_id`,
    [userId, name.trim(), type, icon || '🏷️']
  )

  return result.rows[0]
}

// ============================================================
// UPDATE — Sửa danh mục tùy chỉnh
// ============================================================
const updateCategory = async (userId, categoryId, { name, icon }) => {
  if (!name || name.trim().length === 0) {
    const err = new Error('Tên danh mục không được để trống')
    err.statusCode = 400
    throw err
  }

  // 1. Kiểm tra quyền sở hữu và không cho sửa danh mục mặc định của hệ thống
  const check = await db.query('SELECT * FROM categories WHERE id = $1', [categoryId])
  if (check.rows.length === 0) {
    const err = new Error('Không tìm thấy danh mục')
    err.statusCode = 404
    throw err
  }

  const cat = check.rows[0]
  if (cat.is_default) {
    const err = new Error('Không thể chỉnh sửa danh mục mặc định của hệ thống')
    err.statusCode = 403
    throw err
  }

  if (cat.user_id !== userId) {
    const err = new Error('Bạn không có quyền chỉnh sửa danh mục này')
    err.statusCode = 403
    throw err
  }

  const result = await db.query(
    `UPDATE categories
     SET name = $1, icon = COALESCE($2, icon)
     WHERE id = $3 AND user_id = $4
     RETURNING id, name, type, icon, is_default, user_id`,
    [name.trim(), icon, categoryId, userId]
  )

  return result.rows[0]
}

// ============================================================
// DELETE — Xóa danh mục tùy chỉnh
// ============================================================
const deleteCategory = async (userId, categoryId) => {
  const check = await db.query('SELECT * FROM categories WHERE id = $1', [categoryId])
  if (check.rows.length === 0) {
    const err = new Error('Không tìm thấy danh mục')
    err.statusCode = 404
    throw err
  }

  const cat = check.rows[0]
  if (cat.is_default) {
    const err = new Error('Không thể xóa danh mục mặc định của hệ thống')
    err.statusCode = 403
    throw err
  }

  if (cat.user_id !== userId) {
    const err = new Error('Bạn không có quyền xóa danh mục này')
    err.statusCode = 403
    throw err
  }

  // 2. Kiểm tra xem danh mục có đang được giao dịch hoặc ngân sách nào sử dụng không
  const [txCheck, budgetCheck] = await Promise.all([
    db.query('SELECT COUNT(*)::int AS count FROM transactions WHERE category_id = $1', [categoryId]),
    db.query('SELECT COUNT(*)::int AS count FROM budgets WHERE category_id = $1', [categoryId]),
  ])

  const txCount = txCheck.rows[0].count
  const budgetCount = budgetCheck.rows[0].count

  if (txCount > 0 || budgetCount > 0) {
    const err = new Error(
      `Không thể xóa danh mục này vì đang có ${txCount} giao dịch và ${budgetCount} thiết lập ngân sách liên kết.`
    )
    err.statusCode = 400
    throw err
  }

  await db.query('DELETE FROM categories WHERE id = $1 AND user_id = $2', [categoryId, userId])
  return { message: 'Xóa danh mục thành công', id: categoryId }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
}
