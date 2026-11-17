// Global error handler — bắt mọi lỗi được next(err) chuyển đến
// Express nhận biết đây là error handler vì có 4 tham số (err, req, res, next)
module.exports = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message)
  if (process.env.NODE_ENV !== 'production') console.error(err.stack)

  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}
