import { defineBooking } from '../models/Booking.js'
import { defineBookedSeat } from '../models/BookedSeat.js'
import { defineSeat } from '../models/Seat.js'
import { defineShow } from '../models/Show.js'
import { defineMovie } from '../models/Movie.js'
import { defineAuditorium } from '../models/Auditorium.js'
import { defineTheatre } from '../models/Theatre.js'
import { defineCoupon } from '../models/Coupon.js'
import { defineUser } from '../models/User.js'
import { HTTP_STATUS, API_MESSAGES } from '../constants.js'
import { Op } from 'sequelize'
import TokenCacheService from '../services/tokenCache.js'
import SeatHoldService from '../services/seatHoldService.js'
import PaymentService from '../services/paymentService.js'

export default class CustomerController {
  // ==============================
  // BOOKING MANAGEMENT
  // ==============================

  static async getMyBookings(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query
      const offset = (page - 1) * limit

      const sequelize = req.db
      const Booking = defineBooking(sequelize)
      const Show = defineShow(sequelize)
      const Movie = defineMovie(sequelize)
      const Auditorium = defineAuditorium(sequelize)
      const Theatre = defineTheatre(sequelize)
      const BookedSeat = defineBookedSeat(sequelize)
      const Seat = defineSeat(sequelize)
      
      await Promise.all([
        Booking.sync(), Show.sync(), Movie.sync(), 
        Auditorium.sync(), Theatre.sync(), BookedSeat.sync(), Seat.sync()
      ])

      const where = { customer_id: req.user.userId }
      if (status) where.status = status

      const { count, rows: bookings } = await Booking.findAndCountAll({
        where,
        include: [
          {
            model: Show,
            attributes: ['id', 'show_datetime', 'pricing'],
            include: [
              {
                model: Movie,
                attributes: ['id', 'title', 'poster_url', 'duration_minutes']
              },
              {
                model: Auditorium,
                attributes: ['id', 'name'],
                include: [{
                  model: Theatre,
                  attributes: ['id', 'name', 'address', 'city']
                }]
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      })

      // Get seat details for each booking
      const bookingsWithSeats = await Promise.all(
        bookings.map(async (booking) => {
          const bookedSeats = await BookedSeat.findAll({
            where: { booking_id: booking.id },
            include: [{
              model: Seat,
              attributes: ['id', 'row', 'number', 'category']
            }]
          })

          return {
            ...booking.toJSON(),
            seats: bookedSeats.map(bs => ({
              id: bs.Seat.id,
              row: bs.Seat.row,
              number: bs.Seat.number,
              category: bs.Seat.category,
              price_paid: bs.price_paid
            }))
          }
        })
      )

      return res.json({
        data: bookingsWithSeats,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        },
        message: 'Bookings retrieved successfully'
      })
    } catch (err) {
      console.error(`[CustomerController]-[getMyBookings]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve bookings'
      })
    }
  }

  static async getBookingDetails(req, res) {
    try {
      const { id } = req.params

      const sequelize = req.db
      const Booking = defineBooking(sequelize)
      const Show = defineShow(sequelize)
      const Movie = defineMovie(sequelize)
      const Auditorium = defineAuditorium(sequelize)
      const Theatre = defineTheatre(sequelize)
      const BookedSeat = defineBookedSeat(sequelize)
      const Seat = defineSeat(sequelize)
      const Coupon = defineCoupon(sequelize)
      
      await Promise.all([
        Booking.sync(), Show.sync(), Movie.sync(), 
        Auditorium.sync(), Theatre.sync(), BookedSeat.sync(), 
        Seat.sync(), Coupon.sync()
      ])

      const booking = await Booking.findOne({
        where: { id, customer_id: req.user.userId },
        include: [
          {
            model: Show,
            attributes: ['id', 'show_datetime', 'pricing'],
            include: [
              {
                model: Movie,
                attributes: ['id', 'title', 'poster_url', 'duration_minutes', 'genre', 'rating']
              },
              {
                model: Auditorium,
                attributes: ['id', 'name'],
                include: [{
                  model: Theatre,
                  attributes: ['id', 'name', 'address', 'city']
                }]
              }
            ]
          },
          {
            model: Coupon,
            attributes: ['id', 'code', 'name', 'discount_type', 'value'],
            required: false
          }
        ]
      })

      if (!booking) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Booking not found',
          message: 'Failed to retrieve booking details'
        })
      }

      // Get seat details
      const bookedSeats = await BookedSeat.findAll({
        where: { booking_id: booking.id },
        include: [{
          model: Seat,
          attributes: ['id', 'row', 'number', 'category']
        }]
      })

      const bookingWithSeats = {
        ...booking.toJSON(),
        seats: bookedSeats.map(bs => ({
          id: bs.Seat.id,
          row: bs.Seat.row,
          number: bs.Seat.number,
          category: bs.Seat.category,
          price_paid: bs.price_paid
        }))
      }

      return res.json({
        data: bookingWithSeats,
        message: 'Booking details retrieved successfully'
      })
    } catch (err) {
      console.error(`[CustomerController]-[getBookingDetails]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve booking details'
      })
    }
  }

  static async cancelBooking(req, res) {
    try {
      const { id } = req.params
      const { reason } = req.body

      const sequelize = req.db
      const Booking = defineBooking(sequelize)
      await Booking.sync()

      const booking = await Booking.findOne({
        where: { 
          id, 
          customer_id: req.user.userId,
          status: { [Op.in]: ['pending', 'paid'] }
        }
      })

      if (!booking) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Booking not found or cannot be cancelled',
          message: 'Booking cancellation failed'
        })
      }

      // Check if show is more than 2 hours away
      const show = await defineShow(sequelize).findByPk(booking.show_id)
      if (!show) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Show not found',
          message: 'Booking cancellation failed'
        })
      }

      const showTime = new Date(show.show_datetime)
      const now = new Date()
      const hoursUntilShow = (showTime - now) / (1000 * 60 * 60)

      if (hoursUntilShow < 2) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Cannot cancel booking less than 2 hours before show',
          message: 'Booking cancellation failed'
        })
      }

      // Update booking status
      await booking.update({ 
        status: 'cancelled',
        // Store cancellation reason in a separate field if needed
      })

      // TODO: Implement refund logic based on payment gateway
      // TODO: Release held seats
      // TODO: Send cancellation email

      return res.json({
        data: booking,
        message: 'Booking cancelled successfully'
      })
    } catch (err) {
      console.error(`[CustomerController]-[cancelBooking]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Booking cancellation failed'
      })
    }
  }

  // ==============================
  // SEAT HOLDING & BOOKING
  // ==============================

  static async holdSeats(req, res) {
    try {
      const { show_id, seat_ids } = req.body

      if (!show_id || !seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'show_id and seat_ids array are required',
          message: 'Seat holding failed'
        })
      }

      const sequelize = req.db
      const Show = defineShow(sequelize)
      const Seat = defineSeat(sequelize)
      const Booking = defineBooking(sequelize)
      const BookedSeat = defineBookedSeat(sequelize)
      
      await Promise.all([Show.sync(), Seat.sync(), Booking.sync(), BookedSeat.sync()])

      // Verify show exists and is active
      const show = await Show.findOne({
        where: { 
          id: show_id, 
          status: { [Op.in]: ['scheduled', 'live'] },
          show_datetime: { [Op.gt]: new Date() }
        }
      })

      if (!show) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Show not found or not available for booking',
          message: 'Seat holding failed'
        })
      }

      // Verify all seats exist and belong to the show's auditorium
      const seats = await Seat.findAll({
        where: { 
          id: { [Op.in]: seat_ids },
          auditorium_id: show.auditorium_id
        }
      })

      if (seats.length !== seat_ids.length) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Some seats are invalid or not available for this show',
          message: 'Seat holding failed'
        })
      }

      // Check if seats are already booked
      const existingBookings = await BookedSeat.findAll({
        where: {
          seat_id: { [Op.in]: seat_ids },
          booking_id: {
            [Op.in]: sequelize.literal(`(
              SELECT id FROM bookings 
              WHERE show_id = '${show_id}' 
              AND status IN ('paid', 'pending')
            )`)
          }
        }
      })

      if (existingBookings.length > 0) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: 'Some seats are already booked',
          message: 'Seat holding failed'
        })
      }

      // Create temporary booking with pending status
      const bookingReference = `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      
      const booking = await Booking.create({
        show_id,
        customer_id: req.user.userId,
        customer_email: req.user.email,
        customer_name: req.user.full_name,
        subtotal: 0, // Will be calculated
        total_price: 0, // Will be calculated
        status: 'pending',
        booking_reference: bookingReference,
        tenant_id: show.tenant_id
      })

      // Calculate pricing for each seat
      const seatPricing = []
      let subtotal = 0

      for (const seat of seats) {
        let price = 0
        
        // Get price from show pricing structure
        if (show.pricing[seat.category]) {
          price = show.pricing[seat.category]
        } else if (show.pricing[`row_${seat.row}`]) {
          price = show.pricing[`row_${seat.row}`]
        } else {
          // Default pricing if not specified
          price = 250
        }

        seatPricing.push({ seat_id: seat.id, price })
        subtotal += price
      }

      // Create booked seat records
      await Promise.all(
        seatPricing.map(({ seat_id, price }) =>
          BookedSeat.create({
            booking_id: booking.id,
            seat_id,
            price_paid: price,
            seat_category: seats.find(s => s.id === seat_id).category
          })
        )
      )

      // Update booking with calculated totals
      await booking.update({
        subtotal,
        total_price: subtotal // No taxes or discounts for now
      })

      // Store seat hold using SeatHoldService
      const holdResult = await SeatHoldService.holdSeats(show_id, seat_ids, req.user.userId, 900) // 15 minutes

      return res.status(HTTP_STATUS.CREATED).json({
        data: {
          booking_id: booking.id,
          booking_reference: booking.booking_reference,
          seats: seats.map(seat => ({
            id: seat.id,
            row: seat.row,
            number: seat.number,
            category: seat.category,
            price: seatPricing.find(sp => sp.seat_id === seat.id).price
          })),
          subtotal,
          total_price: subtotal,
          hold_id: holdResult.holdId,
          hold_expires_at: holdResult.expiresAt
        },
        message: 'Seats held successfully'
      })
    } catch (err) {
      console.error(`[CustomerController]-[holdSeats]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Seat holding failed'
      })
    }
  }

  static async confirmBooking(req, res) {
    try {
      const { booking_id, payment_method, payment_details } = req.body

      if (!booking_id || !payment_method || !payment_details) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'booking_id, payment_method, and payment_details are required',
          message: 'Booking confirmation failed'
        })
      }

      const sequelize = req.db
      const Booking = defineBooking(sequelize)
      await Booking.sync()

      const booking = await Booking.findOne({
        where: { 
          id: booking_id, 
          customer_id: req.user.userId,
          status: 'pending'
        }
      })

      if (!booking) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Booking not found or already processed',
          message: 'Booking confirmation failed'
        })
      }

      // Check if seat hold is still valid
      const holdInfo = await SeatHoldService.getHoldInfo(booking_id)
      
      if (!holdInfo) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Seat hold has expired',
          message: 'Booking confirmation failed'
        })
      }

      // Process payment
      const paymentResult = await PaymentService.processPayment({
        booking_id,
        amount: booking.total_price,
        currency: 'INR',
        payment_method,
        payment_details,
        customer_email: booking.customer_email,
        customer_phone: booking.customer_phone
      })

      if (!paymentResult.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: paymentResult.message,
          message: 'Payment processing failed'
        })
      }

      // Generate QR code for ticket
      const ticketQRCode = PaymentService.generateTicketQRCode(
        booking.booking_reference,
        booking.show_id,
        holdInfo.seatIds
      )

      // Update booking status
      await booking.update({
        status: 'paid',
        payment_method,
        payment_id: paymentResult.payment_id,
        ticket_qr_code: ticketQRCode
      })

      // Release seat hold
      await SeatHoldService.releaseSeats(holdInfo.holdId)

      // TODO: Send confirmation email with e-ticket

      return res.json({
        data: {
          booking_id: booking.id,
          booking_reference: booking.booking_reference,
          status: booking.status,
          payment_id: paymentResult.payment_id,
          ticket_qr_code: booking.ticket_qr_code,
          total_price: booking.total_price
        },
        message: 'Booking confirmed successfully'
      })
    } catch (err) {
      console.error(`[CustomerController]-[confirmBooking]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Booking confirmation failed'
      })
    }
  }

  // ==============================
  // COUPON VALIDATION
  // ==============================

  static async validateCoupon(req, res) {
    try {
      const { code, booking_id } = req.body

      if (!code || !booking_id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'code and booking_id are required',
          message: 'Coupon validation failed'
        })
      }

      const sequelize = req.db
      const Coupon = defineCoupon(sequelize)
      const Booking = defineBooking(sequelize)
      await Promise.all([Coupon.sync(), Booking.sync()])

      const booking = await Booking.findOne({
        where: { id: booking_id, customer_id: req.user.userId }
      })

      if (!booking) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Booking not found',
          message: 'Coupon validation failed'
        })
      }

      const coupon = await Coupon.findOne({
        where: { 
          code,
          is_active: true,
          [Op.or]: [
            { expires_at: null },
            { expires_at: { [Op.gt]: new Date() } }
          ]
        }
      })

      if (!coupon) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Invalid or expired coupon',
          message: 'Coupon validation failed'
        })
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Coupon usage limit exceeded',
          message: 'Coupon validation failed'
        })
      }

      // Check minimum purchase amount
      if (coupon.min_purchase_amount && booking.subtotal < coupon.min_purchase_amount) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: `Minimum purchase amount of ₹${coupon.min_purchase_amount} required`,
          message: 'Coupon validation failed'
        })
      }

      // Calculate discount
      let discountAmount = 0
      if (coupon.discount_type === 'percentage') {
        discountAmount = (booking.subtotal * coupon.value) / 100
        if (coupon.max_discount_amount) {
          discountAmount = Math.min(discountAmount, coupon.max_discount_amount)
        }
      } else {
        discountAmount = Math.min(coupon.value, booking.subtotal)
      }

      const newTotal = Math.max(0, booking.subtotal - discountAmount)

      return res.json({
        data: {
          coupon: {
            id: coupon.id,
            code: coupon.code,
            name: coupon.name,
            discount_type: coupon.discount_type,
            value: coupon.value
          },
          discount_amount: discountAmount,
          original_total: booking.subtotal,
          new_total: newTotal
        },
        message: 'Coupon validated successfully'
      })
    } catch (err) {
      console.error(`[CustomerController]-[validateCoupon]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Coupon validation failed'
      })
    }
  }

  static async applyCoupon(req, res) {
    try {
      const { booking_id, coupon_id } = req.body

      if (!booking_id || !coupon_id) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'booking_id and coupon_id are required',
          message: 'Coupon application failed'
        })
      }

      const sequelize = req.db
      const Booking = defineBooking(sequelize)
      const Coupon = defineCoupon(sequelize)
      await Promise.all([Booking.sync(), Coupon.sync()])

      const booking = await Booking.findOne({
        where: { id: booking_id, customer_id: req.user.userId }
      })

      if (!booking) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Booking not found',
          message: 'Coupon application failed'
        })
      }

      const coupon = await Coupon.findByPk(coupon_id)
      if (!coupon) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Coupon not found',
          message: 'Coupon application failed'
        })
      }

      // Calculate discount (same logic as validateCoupon)
      let discountAmount = 0
      if (coupon.discount_type === 'percentage') {
        discountAmount = (booking.subtotal * coupon.value) / 100
        if (coupon.max_discount_amount) {
          discountAmount = Math.min(discountAmount, coupon.max_discount_amount)
        }
      } else {
        discountAmount = Math.min(coupon.value, booking.subtotal)
      }

      const newTotal = Math.max(0, booking.subtotal - discountAmount)

      // Update booking
      await booking.update({
        coupon_id,
        discount_amount: discountAmount,
        total_price: newTotal
      })

      // Increment coupon usage count
      await coupon.increment('usage_count')

      return res.json({
        data: {
          booking_id: booking.id,
          discount_amount: discountAmount,
          total_price: newTotal
        },
        message: 'Coupon applied successfully'
      })
    } catch (err) {
      console.error(`[CustomerController]-[applyCoupon]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Coupon application failed'
      })
    }
  }

  // ==============================
  // PAYMENT METHODS
  // ==============================

  static async getPaymentMethods(req, res) {
    try {
      const paymentMethods = await PaymentService.getAvailablePaymentMethods(req.user.email)

      return res.json({
        data: paymentMethods,
        message: 'Payment methods retrieved successfully'
      })
    } catch (err) {
      console.error(`[CustomerController]-[getPaymentMethods]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve payment methods'
      })
    }
  }
}
