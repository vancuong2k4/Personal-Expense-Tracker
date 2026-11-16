const walletService = require('../services/walletService')

// GET /api/wallets
exports.getWallets = async (req, res, next) => {
  try {
    // req.user.id được inject bởi authMiddleware sau khi verify JWT
    // → Không bao giờ lấy userId từ req.body hay req.query
    const wallets = await walletService.getWalletsByUser(req.user.id)
    res.json(wallets)
  } catch (err) {
    next(err)
  }
}

// POST /api/wallets
exports.createWallet = async (req, res, next) => {
  try {
    const { name, type, balance, currency } = req.body
    if (!name || !type) {
      return res.status(400).json({ message: 'Tên ví và loại ví là bắt buộc' })
    }

    const wallet = await walletService.createWallet(req.user.id, {
      name, type, balance, currency,
    })
    res.status(201).json(wallet)
  } catch (err) {
    next(err)
  }
}

// PUT /api/wallets/:id
exports.updateWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.updateWallet(
      req.user.id,
      req.params.id,
      req.body
    )
    res.json(wallet)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/wallets/:id
exports.deleteWallet = async (req, res, next) => {
  try {
    const result = await walletService.deleteWallet(req.user.id, req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
