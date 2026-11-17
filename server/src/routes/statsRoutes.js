const express = require('express')
const router  = express.Router()
const auth    = require('../middlewares/authMiddleware')
const { getOverview, getMonthlySummary, getCategorySummary } = require('../controllers/statsController')

router.use(auth)
router.get('/overview',     getOverview)
router.get('/monthly',      getMonthlySummary)
router.get('/by-category',  getCategorySummary)

module.exports = router
