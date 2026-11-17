const db = require('../config/db')

// ── Tổng quan tháng hiện tại ─────────────────────────────
const getOverview = async (userId) => {
  const now          = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [monthly, wallets] = await Promise.all([
    db.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0)::numeric AS income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::numeric AS expense,
        COUNT(*)::int AS transaction_count
      FROM transactions
      WHERE user_id = $1
        AND transaction_date >= $2
        AND transaction_date <  $3
    `, [userId, startOfMonth, endOfMonth]),

    db.query(`
      SELECT COALESCE(SUM(balance), 0)::numeric AS total_balance
      FROM wallets WHERE user_id = $1
    `, [userId]),
  ])

  const { income, expense, transaction_count } = monthly.rows[0]
  return {
    income:            parseFloat(income),
    expense:           parseFloat(expense),
    net:               parseFloat(income) - parseFloat(expense),
    transaction_count,
    total_balance:     parseFloat(wallets.rows[0].total_balance),
    month:             now.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
  }
}

// ── Thu/chi theo tháng (bar chart) ───────────────────────
const getMonthlySummary = async (userId, months = 6) => {
  // Tính startDate trong JS → parameterize an toàn, không interpolate vào SQL
  const startDate = new Date()
  startDate.setDate(1)
  startDate.setMonth(startDate.getMonth() - (months - 1))
  startDate.setHours(0, 0, 0, 0)

  const result = await db.query(`
    SELECT
      TO_CHAR(DATE_TRUNC('month', transaction_date), 'YYYY-MM') AS month,
      TO_CHAR(DATE_TRUNC('month', transaction_date), 'MM/YYYY') AS label,
      COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0)::numeric AS income,
      COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::numeric AS expense
    FROM transactions
    WHERE user_id = $1
      AND transaction_date >= $2
    GROUP BY DATE_TRUNC('month', transaction_date)
    ORDER BY month ASC
  `, [userId, startDate])

  // Điền các tháng thiếu với giá trị 0 (nếu tháng đó chưa có giao dịch)
  const rows       = result.rows
  const filled     = []
  const cursor     = new Date(startDate)
  const now        = new Date()

  while (cursor.getFullYear() < now.getFullYear() ||
        (cursor.getFullYear() === now.getFullYear() && cursor.getMonth() <= now.getMonth())) {
    const monthKey = cursor.toISOString().slice(0, 7)
    const label    = cursor.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' })
    const found    = rows.find(r => r.month === monthKey)
    filled.push({
      month:   monthKey,
      label,
      income:  parseFloat(found?.income  || 0),
      expense: parseFloat(found?.expense || 0),
    })
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return filled
}

// ── Phân bổ theo danh mục (pie chart) ───────────────────
const getCategorySummary = async (userId, { type = 'expense', month } = {}) => {
  // month format: 'YYYY-MM' (default: tháng hiện tại)
  const target     = month ? new Date(month + '-01') : new Date()
  const startDate  = new Date(target.getFullYear(), target.getMonth(), 1)
  const endDate    = new Date(target.getFullYear(), target.getMonth() + 1, 1)

  const result = await db.query(`
    SELECT
      c.name,
      c.icon,
      COALESCE(SUM(t.amount), 0)::numeric AS total,
      COUNT(*)::int AS count,
      ROUND(
        SUM(t.amount) * 100.0 / NULLIF(SUM(SUM(t.amount)) OVER (), 0),
        1
      ) AS percentage
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id      = $1
      AND t.type         = $2
      AND t.transaction_date >= $3
      AND t.transaction_date <  $4
    GROUP BY c.id, c.name, c.icon
    ORDER BY total DESC
  `, [userId, type, startDate, endDate])

  return result.rows.map(r => ({
    name:       r.name,
    icon:       r.icon,
    total:      parseFloat(r.total),
    count:      r.count,
    percentage: parseFloat(r.percentage),
  }))
}

module.exports = { getOverview, getMonthlySummary, getCategorySummary }
