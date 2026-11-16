// TODO: Bước 6 — Thống kê
exports.getMonthlySummary = async (req, res, next) => {
  try { res.json({}) } catch (err) { next(err) }
}
exports.getCategorySummary = async (req, res, next) => {
  try { res.json([]) } catch (err) { next(err) }
}
