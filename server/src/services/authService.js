const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/db')

// ============================================================
// REGISTER
// ============================================================
/**
 * Đăng ký user mới
 * - Kiểm tra email tồn tại chưa
 * - Hash password với bcrypt (salt rounds = 12)
 * - INSERT vào DB
 * - Trả về JWT
 */
const registerUser = async ({ email, password, full_name }) => {
  // 1. Kiểm tra email đã tồn tại chưa
  //    Parameterized query ($1) → tránh SQL Injection hoàn toàn
  const existing = await db.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  )
  if (existing.rows.length > 0) {
    const error = new Error('Email đã được sử dụng')
    error.statusCode = 409 // Conflict
    throw error
  }

  // 2. Hash password
  //    - saltRounds = 12: bcrypt chạy 2^12 = 4096 vòng lặp
  //    - Càng cao càng an toàn nhưng càng chậm. 10-12 là chuẩn production
  //    - KHÔNG BAO GIỜ lưu raw password vào DB
  const salt = await bcrypt.genSalt(12)
  const password_hash = await bcrypt.hash(password, salt)

  // 3. INSERT user mới vào DB
  //    RETURNING giúp lấy luôn dữ liệu vừa insert mà không cần query thêm
  const result = await db.query(
    `INSERT INTO users (email, password_hash, full_name)
     VALUES ($1, $2, $3)
     RETURNING id, email, full_name, created_at`,
    [email, password_hash, full_name]
  )
  const newUser = result.rows[0]

  // 4. Tạo JWT và trả về
  const token = signToken(newUser.id, newUser.email)
  return { user: newUser, token }
}

// ============================================================
// LOGIN
// ============================================================
/**
 * Đăng nhập
 * - Tìm user theo email
 * - So sánh password với hash đã lưu (bcrypt.compare)
 * - Trả về JWT
 */
const loginUser = async ({ email, password }) => {
  // 1. Tìm user — lấy cả password_hash để so sánh
  const result = await db.query(
    'SELECT id, email, full_name, password_hash FROM users WHERE email = $1',
    [email]
  )

  // Lưu ý bảo mật: Không được phân biệt lỗi "email không tồn tại" vs "sai password"
  // → Luôn trả về thông báo chung để tránh email enumeration attack
  if (result.rows.length === 0) {
    const error = new Error('Email hoặc mật khẩu không đúng')
    error.statusCode = 401
    throw error
  }

  const user = result.rows[0]

  // 2. So sánh password nhập vào với hash trong DB
  //    bcrypt.compare tự động extract salt từ hash → so sánh an toàn
  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    const error = new Error('Email hoặc mật khẩu không đúng')
    error.statusCode = 401
    throw error
  }

  // 3. Tạo JWT — KHÔNG đưa password_hash vào payload
  const token = signToken(user.id, user.email)
  const { password_hash, ...safeUser } = user // Loại bỏ hash trước khi trả về
  return { user: safeUser, token }
}

// ============================================================
// HELPER: Tạo JWT
// ============================================================
/**
 * JWT có 3 phần: Header.Payload.Signature
 * - Payload chứa: id, email, và thời điểm hết hạn (exp)
 * - Signature được ký bằng JWT_SECRET → server có thể verify
 * - Ai có SECRET đều có thể giả mạo token → SECRET phải bí mật tuyệt đối
 */
const signToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email }, // Payload — thông tin được encode (KHÔNG MÃ HÓA, chỉ encode Base64)
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// ============================================================
// PROFILE & SECURITY
// ============================================================
/**
 * Lấy thông tin tài khoản người dùng kèm số liệu thống kê cơ bản
 */
const getUserProfile = async (userId) => {
  const userResult = await db.query(
    'SELECT id, email, full_name, created_at FROM users WHERE id = $1',
    [userId]
  )
  if (userResult.rows.length === 0) {
    const error = new Error('Người dùng không tồn tại')
    error.statusCode = 404
    throw error
  }

  const [walletsCount, txCount] = await Promise.all([
    db.query('SELECT COUNT(*)::int AS count FROM wallets WHERE user_id = $1', [userId]),
    db.query('SELECT COUNT(*)::int AS count FROM transactions WHERE user_id = $1', [userId]),
  ])

  return {
    ...userResult.rows[0],
    wallet_count: walletsCount.rows[0].count,
    transaction_count: txCount.rows[0].count,
  }
}

/**
 * Cập nhật thông tin hồ sơ (Họ tên)
 */
const updateProfile = async (userId, { full_name }) => {
  if (!full_name || full_name.trim().length === 0) {
    const error = new Error('Họ và tên không được để trống')
    error.statusCode = 400
    throw error
  }

  const result = await db.query(
    `UPDATE users
     SET full_name = $1
     WHERE id = $2
     RETURNING id, email, full_name, created_at`,
    [full_name.trim(), userId]
  )

  if (result.rows.length === 0) {
    const error = new Error('Người dùng không tồn tại')
    error.statusCode = 404
    throw error
  }

  return result.rows[0]
}

/**
 * Đổi mật khẩu
 */
const changePassword = async (userId, { current_password, new_password }) => {
  if (!current_password || !new_password) {
    const error = new Error('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới')
    error.statusCode = 400
    throw error
  }

  if (new_password.length < 6) {
    const error = new Error('Mật khẩu mới phải có ít nhất 6 ký tự')
    error.statusCode = 400
    throw error
  }

  // 1. Lấy password_hash hiện tại
  const userResult = await db.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  )
  if (userResult.rows.length === 0) {
    const error = new Error('Người dùng không tồn tại')
    error.statusCode = 404
    throw error
  }

  // 2. Kiểm tra mật khẩu hiện tại
  const isMatch = await bcrypt.compare(current_password, userResult.rows[0].password_hash)
  if (!isMatch) {
    const error = new Error('Mật khẩu hiện tại không chính xác')
    error.statusCode = 400
    throw error
  }

  // 3. Hash mật khẩu mới và lưu vào DB
  const salt = await bcrypt.genSalt(12)
  const newHash = await bcrypt.hash(new_password, salt)

  await db.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [newHash, userId]
  )

  return { message: 'Đổi mật khẩu thành công' }
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  changePassword,
}
