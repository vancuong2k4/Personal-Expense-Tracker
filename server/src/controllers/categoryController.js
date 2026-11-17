const db = require('../config/db')

// GET /api/categories — Lấy tất cả danh mục (dùng cho dropdown khi tạo giao dịch)
// Categories là dữ liệu tĩnh (seed sẵn) nên không cần auth để đọc
// Nhưng ta vẫn giữ auth để nhất quán với toàn bộ API
exports.getCategories = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, name, type, icon
       FROM categories
       WHERE is_default = true
       ORDER BY type, name`
    )
    res.json(result.rows)
  } catch (err) {
    next(err)
  }
}
