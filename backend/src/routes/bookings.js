import { Router } from 'express'
import { defineBooking } from '../models/Booking.js'
import { defineShow } from '../models/Show.js'

export function createBookingsRouter() {
  const router = Router()

  router.get('/', async (req, res) => {
    const sequelize = req.db
    const Booking = defineBooking(sequelize)
    await Booking.sync()
    const where = req.tenantId ? { tenantId: req.tenantId } : undefined
    const bookings = await Booking.findAll({ where, order: [['createdAt', 'DESC']] })
    res.json(bookings)
  })

  router.post('/', async (req, res) => {
    const sequelize = req.db
    const Booking = defineBooking(sequelize)
    const Show = defineShow(sequelize)
    await Promise.all([Booking.sync(), Show.sync()])

    const { showId, seats, email } = req.body
    const show = await Show.findByPk(showId)
    if (!show) return res.status(404).json({ error: 'Show not found' })

    const totalPrice = (seats || []).reduce((sum, seat) => {
      const price = seat.type === 'premium' ? Number(show.pricingPremium) : Number(show.pricingRegular)
      return sum + price
    }, 0)

    const payload = { showId, seats, email, totalPrice }
    if (req.tenantId) Object.assign(payload, { tenantId: req.tenantId })
    const booking = await Booking.create(payload)
    res.status(201).json(booking)
  })

  return router
}
