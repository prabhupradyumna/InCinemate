import { Router } from 'express'
import authRoutes from './auth.js'
import { createShowsRouter } from './shows.js'
import { createBookingsRouter } from './bookings.js'

const router = Router()

// Health check endpoints
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'inflow-backend' })
})

router.get('/health/db', async (req, res) => {
  try {
    const { sequelize } = await import('../db.js')
    await sequelize.authenticate()
    res.json({ status: 'ok', database: 'connected' })
  } catch (err) {
    res.status(500).json({ status: 'error', message: String(err?.message || err) })
  }
})

// API Routes
router.use('/auth', authRoutes)
router.use('/shows', createShowsRouter())
router.use('/bookings', createBookingsRouter())

export default router
