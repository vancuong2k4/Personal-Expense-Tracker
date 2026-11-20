const categoryService = require('../services/categoryService')

// GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories(req.user.id)
    res.json(categories)
  } catch (err) {
    next(err)
  }
}

// POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const { name, type, icon } = req.body
    const category = await categoryService.createCategory(req.user.id, { name, type, icon })
    res.status(201).json(category)
  } catch (err) {
    next(err)
  }
}

// PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, icon } = req.body
    const category = await categoryService.updateCategory(req.user.id, req.params.id, { name, icon })
    res.json(category)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const result = await categoryService.deleteCategory(req.user.id, req.params.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}
