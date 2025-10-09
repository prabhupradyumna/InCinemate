import { Router } from 'express'
import authRoutes from './auth.js'
import superadminRoutes from './superadmin.js'
import adminRoutes from './admin.js'
import customerRoutes from './customer.js'
import publicRoutes from './public.js'
import uploadRoutes from './upload.js'
import paymentRoutes from './payments.js'
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
router.use('/superadmin', superadminRoutes)
router.use('/admin', adminRoutes)
router.use('/customer', customerRoutes)
router.use('/public', publicRoutes)
router.use('/upload', uploadRoutes)
router.use('/payments', paymentRoutes)

// Legacy routes (for backward compatibility)
router.use('/shows', createShowsRouter())
router.use('/bookings', createBookingsRouter())

export default router
