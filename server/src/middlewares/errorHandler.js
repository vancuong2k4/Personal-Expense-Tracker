// Global error handler — bắt mọi lỗi không được xử lý
module.exports = (err, req, res, next) => {
  console.error(err.stack)
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  })
}
