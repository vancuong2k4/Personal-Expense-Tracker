const express = require('express')
const router = express.Router()
const auth = require('../middlewares/authMiddleware')
const {
  createTransfer,
  getTransfers,
  deleteTransfer,
} = require('../controllers/transferController')

router.use(auth)

router.get('/', getTransfers)
router.post('/', createTransfer)
router.delete('/:id', deleteTransfer)

module.exports = router
