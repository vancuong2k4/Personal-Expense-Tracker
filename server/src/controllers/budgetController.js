const budgetService = require('../services/budgetService')

// GET /api/budgets?month=2024-11
exports.getBudgets = async (req, res, next) => {
  try {
    const { month } = req.query
    const result = await budgetService.getBudgets(req.user.id, month)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// POST /api/budgets
exports.setBudget = async (req, res, next) => {
  try {
    const { category_id, amount, month } = req.body

    if (!category_id || amount === undefined) {
      return res.status(400).json({ message: 'Vui lòng cung cấp category_id và amount' })
    }

    const budget = await budgetService.setBudget(req.user.id, {
      category_id,
      amount,
      month,
    })
    res.status(201).json(budget)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/budgets/:id
exports.deleteBudget = async (req, res, next) => {
  try {
    const result = await budgetService.deleteBudget(req.user.id, req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
