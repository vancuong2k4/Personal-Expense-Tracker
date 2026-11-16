const express = require('express')
const cors = require('cors')
const authRoutes = require('./routes/authRoutes')
const walletRoutes = require('./routes/walletRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const statsRoutes = require('./routes/statsRoutes')
const errorHandler = require('./middlewares/errorHandler')

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/wallets', walletRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/stats', statsRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }))

// Global error handler (phải đặt cuối cùng)
app.use(errorHandler)

module.exports = app
