// TODO: Bước 2 — CRUD Ví
exports.getWallets = async (req, res, next) => {
  try { res.json([]) } catch (err) { next(err) }
}
exports.createWallet = async (req, res, next) => {
  try { res.status(201).json({}) } catch (err) { next(err) }
}
exports.updateWallet = async (req, res, next) => {
  try { res.json({}) } catch (err) { next(err) }
}
exports.deleteWallet = async (req, res, next) => {
  try { res.json({ message: 'deleted' }) } catch (err) { next(err) }
}
