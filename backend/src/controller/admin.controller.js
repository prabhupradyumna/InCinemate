import { defineMovie } from '../models/Movie.js'
import { defineShow } from '../models/Show.js'
import { defineCoupon } from '../models/Coupon.js'
import { defineBooking } from '../models/Booking.js'
import { defineBookedSeat } from '../models/BookedSeat.js'
import { defineSeat } from '../models/Seat.js'
import { defineAuditorium } from '../models/Auditorium.js'
import { defineTheatre } from '../models/Theatre.js'
import { defineAuditoriumRequest } from '../models/AuditoriumRequest.js'
import { defineUser } from '../models/User.js'
import { HTTP_STATUS, API_MESSAGES, ROLES } from '../constants.js'
import { Op } from 'sequelize'

export default class AdminController {
  // ==============================
  // AUDITORIUM REQUEST MANAGEMENT
  // ==============================

  static async submitAuditoriumRequest(req, res) {
    try {
      const { theatre_id, blueprint_url, notes } = req.body

      if (!theatre_id || !blueprint_url) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'theatre_id and blueprint_url are required',
          message: 'Auditorium request submission failed'
        })
      }

      const sequelize = req.db
      const AuditoriumRequest = defineAuditoriumRequest(sequelize)
      const Theatre = defineTheatre(sequelize)
      
      await Promise.all([AuditoriumRequest.sync(), Theatre.sync()])

      // Verify theatre exists
      const theatre = await Theatre.findByPk(theatre_id)
      if (!theatre) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Theatre not found',
          message: 'Auditorium request submission failed'
        })
      }

      const request = await AuditoriumRequest.create({
        theatre_id,
        blueprint_url,
        notes,
        tenant_id: req.tenantId,
        status: 'pending'
      })

      return res.status(HTTP_STATUS.CREATED).json({
        data: request,
        message: 'Auditorium request submitted successfully'
      })
    } catch (err) {
      console.error(`[AdminController]-[submitAuditoriumRequest]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Auditorium request submission failed'
      })
    }
  }

  static async getMyAuditoriumRequests(req, res) {
    try {
      const sequelize = req.db
      const AuditoriumRequest = defineAuditoriumRequest(sequelize)
      const Theatre = defineTheatre(sequelize)
      
      await Promise.all([AuditoriumRequest.sync(), Theatre.sync()])

      const requests = await AuditoriumRequest.findAll({
        where: { tenant_id: req.tenantId },
        include: [{
          model: Theatre,
          attributes: ['id', 'name', 'address', 'city']
        }],
        order: [['createdAt', 'DESC']]
      })

      return res.json({
        data: requests,
        message: 'Auditorium requests retrieved successfully'
      })
    } catch (err) {
      console.error(`[AdminController]-[getMyAuditoriumRequests]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve auditorium requests'
      })
    }
  }

  // ==============================
  // MOVIE MANAGEMENT
  // ==============================

  static async createMovie(req, res) {
    try {
      const { title, poster_url, trailer_url, synopsis, cast, genre, duration_minutes, release_date, rating, language } = req.body

      if (!title) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'title is required',
          message: 'Movie creation failed'
        })
      }

      const sequelize = req.db
      const Movie = defineMovie(sequelize)
      await Movie.sync()

      const movie = await Movie.create({
        title,
        poster_url,
        trailer_url,
        synopsis,
        cast: cast || [],
        genre,
        duration_minutes,
        release_date,
        rating,
        language: language || 'English',
        tenant_id: req.tenantId
      })

      return res.status(HTTP_STATUS.CREATED).json({
        data: movie,
        message: 'Movie created successfully'
      })
    } catch (err) {
      console.error(`[AdminController]-[createMovie]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Movie creation failed'
      })
    }
  }

  static async listMovies(req, res) {
    try {
      const { page = 1, limit = 10, status = 'active' } = req.query
      const offset = (page - 1) * limit

      const sequelize = req.db
      const Movie = defineMovie(sequelize)
      await Movie.sync()

      const where = { tenant_id: req.tenantId }
      if (status === 'active') {
        where.is_active = true
      }

      const { count, rows: movies } = await Movie.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      })

      return res.json({
        data: movies,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        },
        message: 'Movies retrieved successfully'
      })
    } catch (err) {
      console.error(`[AdminController]-[listMovies]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve movies'
      })
    }
  }

  static async updateMovie(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body

      const sequelize = req.db
      const Movie = defineMovie(sequelize)
      await Movie.sync()

      const movie = await Movie.findOne({
        where: { id, tenant_id: req.tenantId }
      })

      if (!movie) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Movie not found',
          message: 'Movie update failed'
        })
      }

      await movie.update(updateData)

      return res.json({
        data: movie,
        message: 'Movie updated successfully'
      })
    } catch (err) {
      console.error(`[AdminController]-[updateMovie]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Movie update failed'
      })
    }
  }

  // ==============================
  // SHOW MANAGEMENT
  // ==============================

  static async scheduleShow(req, res) {
    try {
      const { movie_id, auditorium_id, show_datetime, pricing } = req.body

      if (!movie_id || !auditorium_id || !show_datetime || !pricing) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'movie_id, auditorium_id, show_datetime, and pricing are required',
          message: 'Show scheduling failed'
        })
      }

      const sequelize = req.db
      const Show = defineShow(sequelize)
      const Movie = defineMovie(sequelize)
      const Auditorium = defineAuditorium(sequelize)
      
      await Promise.all([Show.sync(), Movie.sync(), Auditorium.sync()])

      // Verify movie and auditorium exist and belong to tenant
      const [movie, auditorium] = await Promise.all([
        Movie.findOne({ where: { id: movie_id, tenant_id: req.tenantId } }),
        Auditorium.findByPk(auditorium_id)
      ])

      if (!movie) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Movie not found or not owned by tenant',
          message: 'Show scheduling failed'
        })
      }

      if (!auditorium) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Auditorium not found',
          message: 'Show scheduling failed'
        })
      }

      // Check for time conflicts
      const conflictingShow = await Show.findOne({
        where: {
          auditorium_id,
          show_datetime: {
            [Op.between]: [
              new Date(new Date(show_datetime).getTime() - 2 * 60 * 60 * 1000), // 2 hours before
              new Date(new Date(show_datetime).getTime() + 3 * 60 * 60 * 1000)  // 3 hours after
            ]
          },
          status: { [Op.in]: ['scheduled', 'live'] }
        }
      })

      if (conflictingShow) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: 'Time slot conflict with existing show',
          message: 'Show scheduling failed'
        })
      }

      const show = await Show.create({
        movie_id,
        auditorium_id,
        show_datetime: new Date(show_datetime),
        pricing,
        tenant_id: req.tenantId,
        created_by: req.user.userId
      })

      return res.status(HTTP_STATUS.CREATED).json({
        data: show,
        message: 'Show scheduled successfully'
      })
    } catch (err) {
      console.error(`[AdminController]-[scheduleShow]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Show scheduling failed'
      })
    }
  }

  static async listShows(req, res) {
    try {
      const { page = 1, limit = 10, status, movie_id } = req.query
      const offset = (page - 1) * limit

      const sequelize = req.db
      const Show = defineShow(sequelize)
      const Movie = defineMovie(sequelize)
      const Auditorium = defineAuditorium(sequelize)
      const Theatre = defineTheatre(sequelize)
      
      await Promise.all([Show.sync(), Movie.sync(), Auditorium.sync(), Theatre.sync()])

      const where = { tenant_id: req.tenantId }
      if (status) where.status = status
      if (movie_id) where.movie_id = movie_id

      const { count, rows: shows } = await Show.findAndCountAll({
        where,
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
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['show_datetime', 'ASC']]
      })

      return res.json({
        data: shows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        },
        message: 'Shows retrieved successfully'
      })
    } catch (err) {
      console.error(`[AdminController]-[listShows]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve shows'
      })
    }
  }

  // ==============================
  // COUPON MANAGEMENT
  // ==============================

  static async createCoupon(req, res) {
    try {
      const { 
        code, name, description, discount_type, value, 
        min_purchase_amount, max_discount_amount, usage_limit, expires_at 
      } = req.body

      if (!code || !name || !discount_type || !value) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'code, name, discount_type, and value are required',
          message: 'Coupon creation failed'
        })
      }

      const sequelize = req.db
      const Coupon = defineCoupon(sequelize)
      await Coupon.sync()

      // Check if code already exists
      const existingCoupon = await Coupon.findOne({ where: { code } })
      if (existingCoupon) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: 'Coupon code already exists',
          message: 'Coupon creation failed'
        })
      }

      const coupon = await Coupon.create({
        code,
        name,
        description,
        discount_type,
        value,
        min_purchase_amount: min_purchase_amount || 0,
        max_discount_amount,
        usage_limit,
        expires_at: expires_at ? new Date(expires_at) : null,
        tenant_id: req.tenantId,
        created_by: req.user.userId
      })

      return res.status(HTTP_STATUS.CREATED).json({
        data: coupon,
        message: 'Coupon created successfully'
      })
    } catch (err) {
      console.error(`[AdminController]-[createCoupon]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Coupon creation failed'
      })
    }
  }

  static async listCoupons(req, res) {
    try {
      const { page = 1, limit = 10, status = 'active' } = req.query
      const offset = (page - 1) * limit

      const sequelize = req.db
      const Coupon = defineCoupon(sequelize)
      await Coupon.sync()

      const where = { tenant_id: req.tenantId }
      if (status === 'active') {
        where.is_active = true
        where[Op.or] = [
          { expires_at: null },
          { expires_at: { [Op.gt]: new Date() } }
        ]
      }

      const { count, rows: coupons } = await Coupon.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      })

      return res.json({
        data: coupons,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        },
        message: 'Coupons retrieved successfully'
      })
    } catch (err) {
      console.error(`[AdminController]-[listCoupons]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve coupons'
      })
    }
  }

  // ==============================
  // LIVE OPERATIONS DASHBOARD
  // ==============================

  static async getLiveDashboard(req, res) {
    try {
      const { show_id } = req.params

      const sequelize = req.db
      const Show = defineShow(sequelize)
      const Booking = defineBooking(sequelize)
      const BookedSeat = defineBookedSeat(sequelize)
      const Seat = defineSeat(sequelize)
      const Movie = defineMovie(sequelize)
      const Auditorium = defineAuditorium(sequelize)
      
      await Promise.all([
        Show.sync(), Booking.sync(), BookedSeat.sync(), 
        Seat.sync(), Movie.sync(), Auditorium.sync()
      ])

      // Get show details
      const show = await Show.findOne({
        where: { id: show_id, tenant_id: req.tenantId },
        include: [
          {
            model: Movie,
            attributes: ['id', 'title', 'poster_url']
          },
          {
            model: Auditorium,
            attributes: ['id', 'name']
          }
        ]
      })

      if (!show) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Show not found',
          message: 'Failed to retrieve live dashboard'
        })
      }

      // Get all seats for the auditorium
      const allSeats = await Seat.findAll({
        where: { auditorium_id: show.auditorium_id },
        order: [['row', 'ASC'], ['number', 'ASC']]
      })

      // Get booked seats
      const bookedSeats = await BookedSeat.findAll({
        where: {
          booking_id: {
            [Op.in]: sequelize.literal(`(
              SELECT id FROM bookings 
              WHERE show_id = '${show_id}' 
              AND status IN ('paid', 'pending')
            )`)
          }
        },
        include: [{
          model: Booking,
          attributes: ['id', 'customer_name', 'customer_email', 'customer_phone', 'booking_reference']
        }]
      })

      // Create seat status map
      const seatStatusMap = new Map()
      bookedSeats.forEach(bookedSeat => {
        seatStatusMap.set(bookedSeat.seat_id, {
          is_booked: true,
          booking: bookedSeat.Booking
        })
      })

      const seatsWithStatus = allSeats.map(seat => ({
        id: seat.id,
        row: seat.row,
        number: seat.number,
        category: seat.category,
        is_booked: seatStatusMap.has(seat.id),
        booking: seatStatusMap.get(seat.id)?.booking || null
      }))

      // Get booking statistics
      const totalBookings = await Booking.count({
        where: { show_id, status: { [Op.in]: ['paid', 'pending'] } }
      })

      const totalRevenue = await Booking.sum('total_price', {
        where: { show_id, status: 'paid' }
      }) || 0

      return res.json({
        data: {
          show,
          seats: seatsWithStatus,
          statistics: {
            total_seats: allSeats.length,
            booked_seats: bookedSeats.length,
            available_seats: allSeats.length - bookedSeats.length,
            total_bookings: totalBookings,
            total_revenue: totalRevenue
          }
        },
        message: 'Live dashboard data retrieved successfully'
      })
    } catch (err) {
      console.error(`[AdminController]-[getLiveDashboard]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve live dashboard'
      })
    }
  }

  // ==============================
  // TICKET CHECKER MANAGEMENT
  // ==============================

  static async createTicketChecker(req, res) {
    try {
      const { email, full_name, phone } = req.body

      if (!email || !full_name) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'email and full_name are required',
          message: 'Ticket checker creation failed'
        })
      }

      const sequelize = req.db
      const User = defineUser(sequelize)
      await User.sync()

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } })
      if (existingUser) {
        return res.status(HTTP_STATUS.CONFLICT).json({
          success: false,
          error: 'User with this email already exists',
          message: 'Ticket checker creation failed'
        })
      }

      // Generate temporary password
      const tempPassword = Math.random().toString(36).slice(-8)
      const { hashPassword } = await import('../util/auth.util.js')
      const password_hash = await hashPassword(tempPassword)

      const ticketChecker = await User.create({
        email,
        full_name,
        phone,
        password_hash,
        role: ROLES.TICKET_CHECKER,
        tenant_id: req.tenantId,
        is_active: true
      })

      return res.status(HTTP_STATUS.CREATED).json({
        data: {
          id: ticketChecker.id,
          email: ticketChecker.email,
          full_name: ticketChecker.full_name,
          phone: ticketChecker.phone,
          role: ticketChecker.role,
          temp_password: tempPassword
        },
        message: 'Ticket checker created successfully'
      })
    } catch (err) {
      console.error(`[AdminController]-[createTicketChecker]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Ticket checker creation failed'
      })
    }
  }

  static async listTicketCheckers(req, res) {
    try {
      const sequelize = req.db
      const User = defineUser(sequelize)
      await User.sync()

      const ticketCheckers = await User.findAll({
        where: { 
          tenant_id: req.tenantId, 
          role: ROLES.TICKET_CHECKER 
        },
        attributes: ['id', 'email', 'full_name', 'phone', 'is_active', 'createdAt'],
        order: [['createdAt', 'DESC']]
      })

      return res.json({
        data: ticketCheckers,
        message: 'Ticket checkers retrieved successfully'
      })
    } catch (err) {
      console.error(`[AdminController]-[listTicketCheckers]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve ticket checkers'
      })
    }
  }
}
