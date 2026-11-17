const statsService = require('../services/statsService')

// GET /api/stats/overview
exports.getOverview = async (req, res, next) => {
  try {
    const data = await statsService.getOverview(req.user.id)
    res.json(data)
  } catch (err) { next(err) }
}

// GET /api/stats/monthly?months=6
exports.getMonthlySummary = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6
    const data   = await statsService.getMonthlySummary(req.user.id, Math.min(months, 12))
    res.json(data)
  } catch (err) { next(err) }
}

// GET /api/stats/by-category?type=expense&month=2024-11
exports.getCategorySummary = async (req, res, next) => {
  try {
    const { type = 'expense', month } = req.query
    const data = await statsService.getCategorySummary(req.user.id, { type, month })
    res.json(data)
  } catch (err) { next(err) }
}
