const express = require('express')
const router = express.Router()
const auth = require('../middlewares/authMiddleware')
const { getMonthlySummary, getCategorySummary } = require('../controllers/statsController')

router.use(auth)
router.get('/monthly', getMonthlySummary)
router.get('/by-category', getCategorySummary)

module.exports = router
