const txService = require('../services/transactionService')

// GET /api/transactions?wallet_id=&type=&start_date=&end_date=&page=&limit=
exports.getTransactions = async (req, res, next) => {
  try {
    // Tất cả filter params đều lấy từ query string — không cần auth body
    const result = await txService.getTransactions(req.user.id, req.query)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// POST /api/transactions
exports.createTransaction = async (req, res, next) => {
  try {
    const { wallet_id, category_id, type, amount, note, transaction_date } = req.body

    // Validate bắt buộc
    if (!wallet_id || !category_id || !type || !amount) {
      return res.status(400).json({ message: 'Thiếu thông tin: wallet_id, category_id, type, amount là bắt buộc' })
    }
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'type phải là income hoặc expense' })
    }
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Số tiền phải lớn hơn 0' })
    }

    const transaction = await txService.createTransaction(req.user.id, req.body)
    res.status(201).json(transaction)
  } catch (err) {
    next(err)
  }
}

// PUT /api/transactions/:id
exports.updateTransaction = async (req, res, next) => {
  try {
    const transaction = await txService.updateTransaction(req.user.id, req.params.id, req.body)
    res.json(transaction)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res, next) => {
  try {
    const result = await txService.deleteTransaction(req.user.id, req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
