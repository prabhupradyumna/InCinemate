import { Router } from 'express'
import { defineShow } from '../models/Show.js'
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js'

export function createShowsRouter() {
  const router = Router()

  // All show routes require authentication
  router.use(authenticate)

  // GET /shows - accessible by all authenticated users (public viewing)
  router.get('/', authorizeRoles('admin', 'super_admin', 'customer', 'ticket_checker'), async (req, res) => {
    const sequelize = req.db
    const Show = defineShow(sequelize)
    await Show.sync()
    const where = req.tenantId ? { tenantId: req.tenantId } : undefined
    const shows = await Show.findAll({ where, order: [['showDate', 'ASC']] })
    res.json(shows)
  })

  // POST /shows - only admin and super_admin can create shows
  router.post('/', authorizeRoles('admin', 'super_admin'), async (req, res) => {
    const sequelize = req.db
    const Show = defineShow(sequelize)
    await Show.sync()
    const payload = req.tenantId ? { ...req.body, tenantId: req.tenantId } : req.body
    const show = await Show.create(payload)
    res.status(201).json(show)
  })

  return router
}
