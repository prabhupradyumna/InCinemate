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

      const { Show, Movie, Auditorium } = req.models

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

      const { Show, Movie, Auditorium, Theatre } = req.models

      const where = { tenant_id: req.tenantId }
      if (status) where.status = status
      if (movie_id) where.movie_id = movie_id

      const { count, rows: shows } = await Show.findAndCountAll({
        where,
        include: [
          {
            model: Movie,
            as: 'Movie',
            attributes: ['id', 'title', 'poster_url', 'duration_minutes']
          },
          {
            model: Auditorium,
            as: 'Auditorium',
            attributes: ['id', 'name'],
            include: [{
              model: Theatre,
              as: 'Theatre',
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
            total_seats: show.Auditorium.total_seats || allSeats.length,
            booked_seats: bookedSeats.length,
            available_seats: (show.Auditorium.total_seats || allSeats.length) - bookedSeats.length,
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

  // ==============================
  // BOOKING MANAGEMENT
  // ==============================

  static async getAllBookings(req, res) {
    try {
      const { status, search, page = 1, limit = 50 } = req.query
      
      // Use centralized models with pre-configured associations
      const { Booking, Show, Movie, Auditorium, Theatre, BookedSeat, Seat } = req.models

      // Build where clause - admin can see all bookings (same as superadmin)
      let whereClause = {}

      // Add status filter
      if (status && status !== 'all') {
        whereClause.status = status
      }

      // Add search filter
      if (search) {
        whereClause[Op.or] = [
          { booking_reference: { [Op.iLike]: `%${search}%` } },
          { customer_name: { [Op.iLike]: `%${search}%` } },
          { customer_phone: { [Op.iLike]: `%${search}%` } },
          { customer_email: { [Op.iLike]: `%${search}%` } }
        ]
      }

      // Calculate pagination
      const offset = (parseInt(page) - 1) * parseInt(limit)

      // Get bookings with related data
      const { count, rows: bookings } = await Booking.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Show,
            as: 'Show',
            include: [
              {
                model: Movie,
                as: 'Movie'
              },
              {
                model: Auditorium,
                as: 'Auditorium',
                include: [
                  {
                    model: Theatre,
                    as: 'Theatre'
                  }
                ]
              }
            ]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      })

      // Get seat details for each booking
      const bookingsWithSeats = await Promise.all(
        bookings.map(async (booking) => {
          let seats = []
          
          // For public reservations (pending status), use requested_seats from booking
          if (booking.status === 'pending' && booking.requested_seats) {
            seats = booking.requested_seats.map(seat => ({
              row: seat.row || 'Unknown',
              number: seat.number || 0,
              category: seat.category || 'Unknown',
              price: seat.price || 0
            }))
          } else {
            // For confirmed bookings, get seats from BookedSeat table
            const bookedSeats = await BookedSeat.findAll({
              where: { booking_id: booking.id },
              include: [
                {
                  model: Seat
                }
              ]
            })
            
            seats = bookedSeats.map(bs => ({
              row: bs.Seat?.row || 'Unknown',
              number: bs.Seat?.number || 0,
              category: bs.Seat?.category || 'Unknown',
              price: bs.price_paid || 0
            }))
          }

          return {
            id: booking.id,
            booking_reference: booking.booking_reference,
            customer_name: booking.customer_name,
            customer_phone: booking.customer_phone,
            customer_email: booking.customer_email,
            movie_title: booking.Show?.Movie?.title || 'Unknown Movie',
            show_date: booking.Show?.show_datetime ? booking.Show.show_datetime.toISOString().split('T')[0] : 'Unknown Date',
            show_time: booking.Show?.show_datetime ? booking.Show.show_datetime.toTimeString().split(' ')[0].substring(0, 5) : 'Unknown Time',
            venue_name: booking.Show?.Auditorium?.Theatre?.name || 'Unknown Venue',
            screen_name: booking.Show?.Auditorium?.name || 'Unknown Screen',
            seats: seats,
            total_price: booking.total_price || 0,
            booking_status: booking.status || 'unknown',
            created_at: booking.createdAt
          }
        })
      )

      return res.json({
        success: true,
        data: {
          bookings: bookingsWithSeats,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          }
        },
        message: 'Bookings retrieved successfully'
      })
    } catch (err) {
      console.error(`[AdminController]-[getAllBookings]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve bookings'
      })
    }
  }

  // Note: Status update functionality removed for simplicity

  // BOOKED SEATS MANAGEMENT

  // Get all booked seats for management
  static async getAllBookedSeats(req, res) {
    try {
      const { BookedSeat, Booking, Show, Movie, Auditorium, Theatre, Seat } = req.models
      const { page = 1, limit = 50, search } = req.query

      // Build where clause for search
      let whereClause = {}
      if (search) {
        whereClause = {
          [Op.or]: [
            { '$Booking.booking_reference$': { [Op.iLike]: `%${search}%` } },
            { '$Booking.customer_name$': { [Op.iLike]: `%${search}%` } },
            { '$Booking.customer_phone$': { [Op.iLike]: `%${search}%` } },
            { '$Movie.title$': { [Op.iLike]: `%${search}%` } }
          ]
        }
      }

      // Get booked seats with related data
      const { count, rows: bookedSeats } = await BookedSeat.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Booking,
            attributes: ['id', 'booking_reference', 'customer_name', 'customer_phone', 'customer_email', 'status', 'createdAt'],
            include: [
              {
                model: Show,
                attributes: ['id', 'show_datetime'],
                include: [
                  {
                    model: Movie,
                    as: 'Movie',
                    attributes: ['id', 'title']
                  },
                  {
                    model: Auditorium,
                    as: 'Auditorium',
                    attributes: ['id', 'name'],
                    include: [
                      {
                        model: Theatre,
                        as: 'Theatre',
                        attributes: ['id', 'name']
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            model: Seat,
            attributes: ['id', 'row', 'number', 'category']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      })

      // Format the response
      const formattedBookedSeats = bookedSeats.map(bookedSeat => ({
        id: bookedSeat.id,
        booking_reference: bookedSeat.Booking?.booking_reference || 'N/A',
        customer_name: bookedSeat.Booking?.customer_name || 'N/A',
        customer_phone: bookedSeat.Booking?.customer_phone || 'N/A',
        customer_email: bookedSeat.Booking?.customer_email || null,
        movie_title: bookedSeat.Booking?.Show?.Movie?.title || 'Unknown Movie',
        show_date: bookedSeat.Booking?.Show?.show_datetime ? bookedSeat.Booking.Show.show_datetime.toISOString().split('T')[0] : 'Unknown Date',
        show_time: bookedSeat.Booking?.Show?.show_datetime ? bookedSeat.Booking.Show.show_datetime.toTimeString().split(' ')[0].substring(0, 5) : 'Unknown Time',
        venue_name: bookedSeat.Booking?.Show?.Auditorium?.Theatre?.name || 'Unknown Venue',
        screen_name: bookedSeat.Booking?.Show?.Auditorium?.name || 'Unknown Screen',
        seat_row: bookedSeat.Seat?.row || 'N/A',
        seat_number: bookedSeat.Seat?.number || 'N/A',
        seat_category: bookedSeat.Seat?.category || 'N/A',
        booking_status: bookedSeat.Booking?.status || 'unknown',
        created_at: bookedSeat.createdAt
      }))

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: {
          booked_seats: formattedBookedSeats,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / parseInt(limit))
          }
        },
        message: 'Booked seats retrieved successfully'
      })

    } catch (err) {
      console.error(`[AdminController]-[getAllBookedSeats]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve booked seats'
      })
    }
  }

  // Delete/release a booked seat
  static async deleteBookedSeat(req, res) {
    try {
      const { seatId } = req.params
      const { BookedSeat } = req.models

      // Find the booked seat
      const bookedSeat = await BookedSeat.findByPk(seatId)
      if (!bookedSeat) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          message: 'Booked seat not found'
        })
      }

      // Delete the booked seat
      await bookedSeat.destroy()

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Booked seat released successfully'
      })

    } catch (err) {
      console.error(`[AdminController]-[deleteBookedSeat]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to release booked seat'
      })
    }
  }
}
