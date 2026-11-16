const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // "Bearer <token>"

  if (!token) return res.status(401).json({ message: 'Access token required' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { id, email }
    next()
  } catch {
    return res.status(403).json({ message: 'Invalid or expired token' })
  }
}
