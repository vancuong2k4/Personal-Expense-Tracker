const express    = require('express')
const router     = express.Router()
const auth       = require('../middlewares/authMiddleware')
const { getCategories } = require('../controllers/categoryController')

router.use(auth)
router.get('/', getCategories)

module.exports = router
