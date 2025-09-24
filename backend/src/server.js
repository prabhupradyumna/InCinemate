import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { attachTenantDb } from './middleware/tenant-db.js'
import { createShowsRouter } from './routes/shows.js'
import { createBookingsRouter } from './routes/bookings.js'
import authRoutes from './routes/auth.js'
import { sequelize } from './db.js'

const app = express()

// CORS with multiple allowed origins (comma-separated in ORIGIN_URLS)
const allowedOrigins = (process.env.ORIGIN_URLS || process.env.ORIGIN_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`Origin ${origin} not allowed by CORS`))
  },
  credentials: true
}))
// Handle preflight for all routes
app.options('*', cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`Origin ${origin} not allowed by CORS`))
  },
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(attachTenantDb())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'inflow-backend' })
})

app.get('/health/db', async (_req, res) => {
  try {
    await sequelize.authenticate()
    res.json({ status: 'ok', database: 'connected' })
  } catch (err) {
    res.status(500).json({ status: 'error', message: String(err?.message || err) })
  }
})

// Optionally auto-sync schema in controlled environments
const DB_SYNC_ALTER = String(process.env.DB_SYNC_ALTER || '').toLowerCase() === 'true'
if (DB_SYNC_ALTER) {
  sequelize
    .sync({ alter: true })
    .then(() => console.log('[db] sync alter completed'))
    .catch((e) => console.error('[db] sync alter failed', e))
}

// Auth routes
app.use('/api/auth', authRoutes)

// Protected routes
app.use('/api/shows', createShowsRouter())
app.use('/api/bookings', createBookingsRouter())

const port = Number(process.env.PORT || 4000)
app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`)
})
