const recurringService = require('../services/recurringService')

// GET /api/recurring
exports.getRecurring = async (req, res, next) => {
  try {
    const list = await recurringService.getRecurring(req.user.id)
    res.json(list)
  } catch (err) {
    next(err)
  }
}

// POST /api/recurring
exports.createRecurring = async (req, res, next) => {
  try {
    const item = await recurringService.createRecurring(req.user.id, req.body)
    res.status(201).json(item)
  } catch (err) {
    next(err)
  }
}

// PATCH /api/recurring/:id/toggle
exports.toggleRecurring = async (req, res, next) => {
  try {
    const item = await recurringService.toggleRecurring(req.user.id, req.params.id)
    res.json(item)
  } catch (err) {
    next(err)
  }
}

// POST /api/recurring/:id/execute
exports.executeRecurring = async (req, res, next) => {
  try {
    const result = await recurringService.executeRecurring(req.user.id, req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/recurring/:id
exports.deleteRecurring = async (req, res, next) => {
  try {
    const result = await recurringService.deleteRecurring(req.user.id, req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
