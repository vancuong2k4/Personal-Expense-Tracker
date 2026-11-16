const { registerUser, loginUser } = require('../services/authService')

/**
 * Controller chỉ làm đúng 1 việc:
 *   1. Lấy data từ req.body
 *   2. Gọi service tương ứng
 *   3. Trả response (hoặc chuyển lỗi cho errorHandler qua next)
 *
 * Mọi business logic nằm hoàn toàn trong authService.js
 */

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body

    // Validate input cơ bản
    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    }

    const { user, token } = await registerUser({ email, password, full_name })

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user,
    })
  } catch (err) {
    next(err) // Chuyển lỗi đến global errorHandler
  }
}

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' })
    }

    const { user, token } = await loginUser({ email, password })

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user,
    })
  } catch (err) {
    next(err)
  }
}
