// TODO: Bước 4 — CRUD Giao dịch
exports.getTransactions = async (req, res, next) => {
  try { res.json([]) } catch (err) { next(err) }
}
exports.createTransaction = async (req, res, next) => {
  try { res.status(201).json({}) } catch (err) { next(err) }
}
exports.updateTransaction = async (req, res, next) => {
  try { res.json({}) } catch (err) { next(err) }
}
exports.deleteTransaction = async (req, res, next) => {
  try { res.json({ message: 'deleted' }) } catch (err) { next(err) }
}
