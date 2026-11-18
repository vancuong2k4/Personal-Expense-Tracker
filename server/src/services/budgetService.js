const db = require('../config/db')

// Helper format tháng hiện tại 'YYYY-MM'
const getCurrentMonth = () => new Date().toISOString().slice(0, 7)

// ============================================================
// GET — Lấy danh sách ngân sách theo tháng kèm tiến độ chi tiêu
// ============================================================
const getBudgets = async (userId, targetMonth) => {
  const month = targetMonth || getCurrentMonth()

  // Truy vấn budgets JOIN categories và LEFT JOIN transactions trong tháng tương ứng
  const query = `
    SELECT
      b.id,
      b.category_id,
      c.name AS category_name,
      c.icon AS category_icon,
      b.amount::numeric AS amount,
      b.month,
      b.created_at,
      b.updated_at,
      COALESCE(SUM(t.amount), 0)::numeric AS spent,
      COUNT(t.id)::int AS transaction_count
    FROM budgets b
    JOIN categories c ON b.category_id = c.id
    LEFT JOIN transactions t ON t.category_id = b.category_id
      AND t.user_id = b.user_id
      AND t.type = 'expense'
      AND TO_CHAR(t.transaction_date, 'YYYY-MM') = b.month
    WHERE b.user_id = $1 AND b.month = $2
    GROUP BY b.id, c.id, c.name, c.icon
    ORDER BY b.amount DESC, c.name ASC
  `

  const result = await db.query(query, [userId, month])

  let totalBudget = 0
  let totalSpent = 0

  const items = result.rows.map(row => {
    const amount = parseFloat(row.amount)
    const spent = parseFloat(row.spent)
    const remaining = amount - spent
    const percentage = amount > 0 ? Math.round((spent / amount) * 100 * 10) / 10 : 0

    totalBudget += amount
    totalSpent += spent

    let status = 'normal'
    if (percentage >= 100) {
      status = 'exceeded' // Vượt ngân sách
    } else if (percentage >= 80) {
      status = 'warning'  // Cảnh báo gần chạm mức
    }

    return {
      id: row.id,
      category_id: row.category_id,
      category_name: row.category_name,
      category_icon: row.category_icon,
      amount,
      spent,
      remaining,
      percentage,
      status,
      is_exceeded: spent > amount,
      transaction_count: row.transaction_count,
      month: row.month,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }
  })

  const totalRemaining = totalBudget - totalSpent
  const overallPercentage = totalBudget > 0
    ? Math.round((totalSpent / totalBudget) * 100 * 10) / 10
    : 0

  return {
    month,
    summary: {
      total_budget: totalBudget,
      total_spent: totalSpent,
      total_remaining: totalRemaining,
      overall_percentage: overallPercentage,
      is_exceeded: totalSpent > totalBudget,
      budget_count: items.length,
      warning_count: items.filter(i => i.status === 'warning').length,
      exceeded_count: items.filter(i => i.status === 'exceeded').length,
    },
    budgets: items,
  }
}

// ============================================================
// SET/UPSERT — Tạo hoặc cập nhật ngân sách cho danh mục trong tháng
// ============================================================
const setBudget = async (userId, { category_id, amount, month }) => {
  const targetMonth = month || getCurrentMonth()
  const numAmount = parseFloat(amount)

  if (!category_id) {
    const err = new Error('category_id là bắt buộc')
    err.statusCode = 400
    throw err
  }

  if (isNaN(numAmount) || numAmount <= 0) {
    const err = new Error('Hạn mức ngân sách phải lớn hơn 0')
    err.statusCode = 400
    throw err
  }

  // Kiểm tra danh mục có tồn tại và thuộc loại 'expense' không
  const categoryCheck = await db.query(
    'SELECT id, name, type FROM categories WHERE id = $1',
    [category_id]
  )
  if (categoryCheck.rows.length === 0) {
    const err = new Error('Danh mục không tồn tại')
    err.statusCode = 404
    throw err
  }
  if (categoryCheck.rows[0].type !== 'expense') {
    const err = new Error('Chỉ có thể đặt ngân sách cho danh mục Chi tiêu (expense)')
    err.statusCode = 400
    throw err
  }

  // UPSERT: Nếu đã có ngân sách cho category + month thì update amount
  const query = `
    INSERT INTO budgets (user_id, category_id, amount, month)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id, category_id, month)
    DO UPDATE SET
      amount = EXCLUDED.amount,
      updated_at = NOW()
    RETURNING id, category_id, amount::numeric, month, created_at, updated_at
  `
  const result = await db.query(query, [userId, category_id, numAmount, targetMonth])
  return result.rows[0]
}

// ============================================================
// DELETE — Xóa ngân sách
// ============================================================
const deleteBudget = async (userId, budgetId) => {
  const result = await db.query(
    'DELETE FROM budgets WHERE id = $1 AND user_id = $2 RETURNING id, category_id, month',
    [budgetId, userId]
  )

  if (result.rowCount === 0) {
    const err = new Error('Không tìm thấy ngân sách hoặc bạn không có quyền xóa')
    err.statusCode = 404
    throw err
  }

  return { message: 'Xóa ngân sách thành công', id: budgetId }
}

module.exports = {
  getBudgets,
  setBudget,
  deleteBudget,
}
