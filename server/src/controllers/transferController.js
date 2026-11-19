const transferService = require('../services/transferService')

// POST /api/transfers
exports.createTransfer = async (req, res, next) => {
  try {
    const { from_wallet_id, to_wallet_id, amount, fee, note, transfer_date } = req.body

    if (!from_wallet_id || !to_wallet_id || !amount) {
      return res.status(400).json({
        message: 'Thiếu thông tin: from_wallet_id, to_wallet_id, amount là bắt buộc',
      })
    }

    const transfer = await transferService.createTransfer(req.user.id, {
      from_wallet_id,
      to_wallet_id,
      amount,
      fee,
      note,
      transfer_date,
    })

    res.status(201).json({
      message: 'Chuyển tiền thành công',
      transfer,
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/transfers?page=1&limit=20
exports.getTransfers = async (req, res, next) => {
  try {
    const result = await transferService.getTransfers(req.user.id, req.query)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/transfers/:id
exports.deleteTransfer = async (req, res, next) => {
  try {
    const result = await transferService.deleteTransfer(req.user.id, req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
