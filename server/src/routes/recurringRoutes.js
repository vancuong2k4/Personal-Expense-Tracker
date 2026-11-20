const express = require('express')
const router = express.Router()
const auth = require('../middlewares/authMiddleware')
const {
  getRecurring,
  createRecurring,
  toggleRecurring,
  executeRecurring,
  deleteRecurring,
} = require('../controllers/recurringController')

router.use(auth)

router.get('/', getRecurring)
router.post('/', createRecurring)
router.patch('/:id/toggle', toggleRecurring)
router.post('/:id/execute', executeRecurring)
router.delete('/:id', deleteRecurring)

module.exports = router
