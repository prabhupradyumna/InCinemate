import { Router } from 'express'
import { defineShow } from '../models/Show.js'

export function createShowsRouter() {
  const router = Router()

  router.get('/', async (req, res) => {
    const sequelize = req.db
    const Show = defineShow(sequelize)
    await Show.sync()
    const where = req.tenantId ? { tenantId: req.tenantId } : undefined
    const shows = await Show.findAll({ where, order: [['showDate', 'ASC']] })
    res.json(shows)
  })

  router.post('/', async (req, res) => {
    const sequelize = req.db
    const Show = defineShow(sequelize)
    await Show.sync()
    const payload = req.tenantId ? { ...req.body, tenantId: req.tenantId } : req.body
    const show = await Show.create(payload)
    res.status(201).json(show)
  })

  return router
}
