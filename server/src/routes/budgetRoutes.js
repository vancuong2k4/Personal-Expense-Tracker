const express = require('express')
const router = express.Router()
const auth = require('../middlewares/authMiddleware')
const {
  getBudgets,
  setBudget,
  deleteBudget,
} = require('../controllers/budgetController')

// Mọi route ngân sách đều cần xác thực người dùng
router.use(auth)

router.get('/', getBudgets)
router.post('/', setBudget)
router.delete('/:id', deleteBudget)

module.exports = router
