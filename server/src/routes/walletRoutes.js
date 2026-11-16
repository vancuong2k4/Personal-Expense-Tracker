const express = require('express')
const router = express.Router()
const auth = require('../middlewares/authMiddleware')
const {
  getWallets, createWallet, updateWallet, deleteWallet,
} = require('../controllers/walletController')

router.use(auth) // Tất cả wallet routes đều cần đăng nhập
router.get('/', getWallets)
router.post('/', createWallet)
router.put('/:id', updateWallet)
router.delete('/:id', deleteWallet)

module.exports = router
