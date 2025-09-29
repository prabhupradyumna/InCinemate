import { defineMovie } from '../models/Movie.js'
import { defineShow } from '../models/Show.js'
import { defineSeat } from '../models/Seat.js'
import { defineAuditorium } from '../models/Auditorium.js'
import { defineTheatre } from '../models/Theatre.js'
import { defineBooking } from '../models/Booking.js'
import { defineBookedSeat } from '../models/BookedSeat.js'
import { defineCoupon } from '../models/Coupon.js'
import { HTTP_STATUS, API_MESSAGES } from '../constants.js'
import { Op } from 'sequelize'

export default class PublicController {
  // ==============================
  // LOCATION-BASED MOVIE DISCOVERY
  // ==============================

  static async searchMoviesByLocation(req, res) {
    try {
      const { city, date, genre, language } = req.query

      if (!city) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'city parameter is required',
          message: 'Movie search failed'
        })
      }

      const sequelize = req.db
      const Movie = defineMovie(sequelize)
      const Show = defineShow(sequelize)
      const Auditorium = defineAuditorium(sequelize)
      const Theatre = defineTheatre(sequelize)
      
      await Promise.all([Movie.sync(), Show.sync(), Auditorium.sync(), Theatre.sync()])

      // Build date filter
      let dateFilter = {}
      if (date) {
        const searchDate = new Date(date)
        const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0))
        const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999))
        dateFilter = {
          show_datetime: {
            [Op.between]: [startOfDay, endOfDay]
          }
        }
      } else {
        // Default to today and future shows
        dateFilter = {
          show_datetime: {
            [Op.gte]: new Date()
          }
        }
      }

      // Build movie filters
      const movieFilters = { is_active: true }
      if (genre) movieFilters.genre = genre
      if (language) movieFilters.language = language

      // Find shows in the specified city
      const shows = await Show.findAll({
        where: {
          ...dateFilter,
          status: { [Op.in]: ['scheduled', 'live'] }
        },
        include: [
          {
            model: Movie,
            where: movieFilters,
            attributes: ['id', 'title', 'poster_url', 'trailer_url', 'synopsis', 'cast', 'genre', 'duration_minutes', 'rating', 'language']
          },
          {
            model: Auditorium,
            attributes: ['id', 'name'],
            include: [{
              model: Theatre,
              where: { city: { [Op.iLike]: `%${city}%` } },
              attributes: ['id', 'name', 'address', 'city']
            }]
          }
        ],
        order: [['show_datetime', 'ASC']]
      })

      // Group shows by movie
      const moviesMap = new Map()
      
      shows.forEach(show => {
        const movieId = show.Movie.id
        if (!moviesMap.has(movieId)) {
          moviesMap.set(movieId, {
            movie: show.Movie,
            theatres: new Map()
          })
        }

        const theatreId = show.Auditorium.Theatre.id
        if (!moviesMap.get(movieId).theatres.has(theatreId)) {
          moviesMap.get(movieId).theatres.set(theatreId, {
            theatre: show.Auditorium.Theatre,
            auditoriums: new Map()
          })
        }

        const auditoriumId = show.Auditorium.id
        if (!moviesMap.get(movieId).theatres.get(theatreId).auditoriums.has(auditoriumId)) {
          moviesMap.get(movieId).theatres.get(theatreId).auditoriums.set(auditoriumId, {
            auditorium: show.Auditorium,
            shows: []
          })
        }

        moviesMap.get(movieId).theatres.get(theatreId).auditoriums.get(auditoriumId).shows.push({
          id: show.id,
          show_datetime: show.show_datetime,
          pricing: show.pricing
        })
      })

      // Convert to response format
      const movies = Array.from(moviesMap.values()).map(({ movie, theatres }) => ({
        ...movie.toJSON(),
        theatres: Array.from(theatres.values()).map(({ theatre, auditoriums }) => ({
          ...theatre.toJSON(),
          auditoriums: Array.from(auditoriums.values()).map(({ auditorium, shows }) => ({
            ...auditorium.toJSON(),
            shows
          }))
        }))
      }))

      return res.json({
        data: {
          movies,
          search_criteria: {
            city,
            date,
            genre,
            language
          },
          total_movies: movies.length
        },
        message: 'Movies retrieved successfully'
      })
    } catch (err) {
      console.error(`[PublicController]-[searchMoviesByLocation]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Movie search failed'
      })
    }
  }

  static async getMovieDetails(req, res) {
    try {
      const { id } = req.params
      const { city } = req.query

      const sequelize = req.db
      const Movie = defineMovie(sequelize)
      const Show = defineShow(sequelize)
      const Auditorium = defineAuditorium(sequelize)
      const Theatre = defineTheatre(sequelize)
      
      await Promise.all([Movie.sync(), Show.sync(), Auditorium.sync(), Theatre.sync()])

      const movie = await Movie.findOne({
        where: { id, is_active: true }
      })

      if (!movie) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Movie not found',
          message: 'Failed to retrieve movie details'
        })
      }

      // Get upcoming shows for this movie
      const showFilters = {
        movie_id: id,
        show_datetime: { [Op.gte]: new Date() },
        status: { [Op.in]: ['scheduled', 'live'] }
      }

      const shows = await Show.findAll({
        where: showFilters,
        include: [
          {
            model: Auditorium,
            attributes: ['id', 'name'],
            include: [{
              model: Theatre,
              where: city ? { city: { [Op.iLike]: `%${city}%` } } : {},
              attributes: ['id', 'name', 'address', 'city']
            }]
          }
        ],
        order: [['show_datetime', 'ASC']]
      })

      // Group shows by theatre and auditorium
      const theatresMap = new Map()
      
      shows.forEach(show => {
        const theatreId = show.Auditorium.Theatre.id
        if (!theatresMap.has(theatreId)) {
          theatresMap.set(theatreId, {
            theatre: show.Auditorium.Theatre,
            auditoriums: new Map()
          })
        }

        const auditoriumId = show.Auditorium.id
        if (!theatresMap.get(theatreId).auditoriums.has(auditoriumId)) {
          theatresMap.get(theatreId).auditoriums.set(auditoriumId, {
            auditorium: show.Auditorium,
            shows: []
          })
        }

        theatresMap.get(theatreId).auditoriums.get(auditoriumId).shows.push({
          id: show.id,
          show_datetime: show.show_datetime,
          pricing: show.pricing
        })
      })

      const theatres = Array.from(theatresMap.values()).map(({ theatre, auditoriums }) => ({
        ...theatre.toJSON(),
        auditoriums: Array.from(auditoriums.values()).map(({ auditorium, shows }) => ({
          ...auditorium.toJSON(),
          shows
        }))
      }))

      return res.json({
        data: {
          movie: movie.toJSON(),
          theatres,
          total_shows: shows.length
        },
        message: 'Movie details retrieved successfully'
      })
    } catch (err) {
      console.error(`[PublicController]-[getMovieDetails]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve movie details'
      })
    }
  }

  // ==============================
  // SEAT MAP & AVAILABILITY
  // ==============================

  static async getSeatMap(req, res) {
    try {
      const { show_id } = req.params

      const sequelize = req.db
      const Show = defineShow(sequelize)
      const Seat = defineSeat(sequelize)
      const Auditorium = defineAuditorium(sequelize)
      const Theatre = defineTheatre(sequelize)
      const Movie = defineMovie(sequelize)
      const Booking = defineBooking(sequelize)
      const BookedSeat = defineBookedSeat(sequelize)
      
      await Promise.all([
        Show.sync(), Seat.sync(), Auditorium.sync(), 
        Theatre.sync(), Movie.sync(), Booking.sync(), BookedSeat.sync()
      ])

      // Get show details
      const show = await Show.findOne({
        where: { 
          id: show_id,
          status: { [Op.in]: ['scheduled', 'live'] },
          show_datetime: { [Op.gte]: new Date() }
        },
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
      })

      if (!show) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Show not found or not available for booking',
          message: 'Failed to retrieve seat map'
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
        }
      })

      const bookedSeatIds = new Set(bookedSeats.map(bs => bs.seat_id))

      // Create seat map with availability status
      const seatMap = allSeats.map(seat => {
        let price = 250 // Default price
        
        // Get price from show pricing structure
        if (show.pricing[seat.category]) {
          price = show.pricing[seat.category]
        } else if (show.pricing[`row_${seat.row}`]) {
          price = show.pricing[`row_${seat.row}`]
        }

        return {
          id: seat.id,
          row: seat.row,
          number: seat.number,
          category: seat.category,
          price,
          is_available: !bookedSeatIds.has(seat.id)
        }
      })

      // Group seats by row for easier frontend rendering
      const seatsByRow = {}
      seatMap.forEach(seat => {
        if (!seatsByRow[seat.row]) {
          seatsByRow[seat.row] = []
        }
        seatsByRow[seat.row].push(seat)
      })

      return res.json({
        data: {
          show: {
            id: show.id,
            show_datetime: show.show_datetime,
            pricing: show.pricing,
            movie: show.Movie,
            auditorium: show.Auditorium,
            theatre: show.Auditorium.Theatre
          },
          seat_map: seatsByRow,
          statistics: {
            total_seats: allSeats.length,
            available_seats: allSeats.length - bookedSeatIds.size,
            booked_seats: bookedSeatIds.size
          }
        },
        message: 'Seat map retrieved successfully'
      })
    } catch (err) {
      console.error(`[PublicController]-[getSeatMap]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve seat map'
      })
    }
  }

  // ==============================
  // PUBLIC BOOKING (GUEST)
  // ==============================

  static async createGuestBooking(req, res) {
    try {
      const { 
        show_id, 
        seat_ids, 
        customer_email, 
        customer_name, 
        customer_phone,
        coupon_code 
      } = req.body

      if (!show_id || !seat_ids || !customer_email) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'show_id, seat_ids, and customer_email are required',
          message: 'Booking creation failed'
        })
      }

      const sequelize = req.db
      const Show = defineShow(sequelize)
      const Seat = defineSeat(sequelize)
      const Booking = defineBooking(sequelize)
      const BookedSeat = defineBookedSeat(sequelize)
      const Coupon = defineCoupon(sequelize)
      
      await Promise.all([
        Show.sync(), Seat.sync(), Booking.sync(), 
        BookedSeat.sync(), Coupon.sync()
      ])

      // Verify show exists and is available
      const show = await Show.findOne({
        where: { 
          id: show_id,
          status: { [Op.in]: ['scheduled', 'live'] },
          show_datetime: { [Op.gte]: new Date() }
        }
      })

      if (!show) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
          success: false,
          error: 'Show not found or not available for booking',
          message: 'Booking creation failed'
        })
      }

      // Verify seats exist and are available
      const seats = await Seat.findAll({
        where: { 
          id: { [Op.in]: seat_ids },
          auditorium_id: show.auditorium_id
        }
      })

      if (seats.length !== seat_ids.length) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Some seats are invalid',
          message: 'Booking creation failed'
        })
      }

      // Check seat availability
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
          message: 'Booking creation failed'
        })
      }

      // Calculate pricing
      const seatPricing = []
      let subtotal = 0

      for (const seat of seats) {
        let price = 0
        
        if (show.pricing[seat.category]) {
          price = show.pricing[seat.category]
        } else if (show.pricing[`row_${seat.row}`]) {
          price = show.pricing[`row_${seat.row}`]
        } else {
          price = 250
        }

        seatPricing.push({ seat_id: seat.id, price })
        subtotal += price
      }

      // Handle coupon if provided
      let discountAmount = 0
      let couponId = null

      if (coupon_code) {
        const coupon = await Coupon.findOne({
          where: { 
            code: coupon_code,
            is_active: true,
            [Op.or]: [
              { expires_at: null },
              { expires_at: { [Op.gt]: new Date() } }
            ]
          }
        })

        if (coupon && coupon.usage_count < (coupon.usage_limit || Infinity)) {
          if (coupon.min_purchase_amount && subtotal >= coupon.min_purchase_amount) {
            if (coupon.discount_type === 'percentage') {
              discountAmount = (subtotal * coupon.value) / 100
              if (coupon.max_discount_amount) {
                discountAmount = Math.min(discountAmount, coupon.max_discount_amount)
              }
            } else {
              discountAmount = Math.min(coupon.value, subtotal)
            }
            couponId = coupon.id
          }
        }
      }

      const totalPrice = Math.max(0, subtotal - discountAmount)

      // Create booking
      const bookingReference = `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      
      const booking = await Booking.create({
        show_id,
        customer_email,
        customer_name,
        customer_phone,
        subtotal,
        discount_amount: discountAmount,
        total_price: totalPrice,
        coupon_id: couponId,
        status: 'pending',
        booking_reference: bookingReference,
        tenant_id: show.tenant_id
      })

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

      // Update coupon usage if applied
      if (couponId) {
        await Coupon.increment('usage_count', { where: { id: couponId } })
      }

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
          discount_amount: discountAmount,
          total_price: totalPrice,
          status: booking.status
        },
        message: 'Booking created successfully'
      })
    } catch (err) {
      console.error(`[PublicController]-[createGuestBooking]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Booking creation failed'
      })
    }
  }

  // ==============================
  // SEARCH & FILTERS
  // ==============================

  static async searchMovies(req, res) {
    try {
      const { q, city, genre, language, date } = req.query

      if (!q) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          error: 'Search query (q) is required',
          message: 'Movie search failed'
        })
      }

      const sequelize = req.db
      const Movie = defineMovie(sequelize)
      const Show = defineShow(sequelize)
      const Auditorium = defineAuditorium(sequelize)
      const Theatre = defineTheatre(sequelize)
      
      await Promise.all([Movie.sync(), Show.sync(), Auditorium.sync(), Theatre.sync()])

      // Build search filters
      const movieFilters = {
        is_active: true,
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { cast: { [Op.contains]: [{ name: { [Op.iLike]: `%${q}%` } }] } }
        ]
      }

      if (genre) movieFilters.genre = genre
      if (language) movieFilters.language = language

      // Build show filters
      let showFilters = {
        status: { [Op.in]: ['scheduled', 'live'] },
        show_datetime: { [Op.gte]: new Date() }
      }

      if (date) {
        const searchDate = new Date(date)
        const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0))
        const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999))
        showFilters.show_datetime = {
          [Op.between]: [startOfDay, endOfDay]
        }
      }

      // Find movies with shows
      const shows = await Show.findAll({
        where: showFilters,
        include: [
          {
            model: Movie,
            where: movieFilters,
            attributes: ['id', 'title', 'poster_url', 'trailer_url', 'synopsis', 'cast', 'genre', 'duration_minutes', 'rating', 'language']
          },
          {
            model: Auditorium,
            attributes: ['id', 'name'],
            include: [{
              model: Theatre,
              where: city ? { city: { [Op.iLike]: `%${city}%` } } : {},
              attributes: ['id', 'name', 'address', 'city']
            }]
          }
        ],
        order: [['show_datetime', 'ASC']]
      })

      // Group by movie and format response
      const moviesMap = new Map()
      
      shows.forEach(show => {
        const movieId = show.Movie.id
        if (!moviesMap.has(movieId)) {
          moviesMap.set(movieId, {
            movie: show.Movie,
            theatres: new Map()
          })
        }

        const theatreId = show.Auditorium.Theatre.id
        if (!moviesMap.get(movieId).theatres.has(theatreId)) {
          moviesMap.get(movieId).theatres.set(theatreId, {
            theatre: show.Auditorium.Theatre,
            auditoriums: new Map()
          })
        }

        const auditoriumId = show.Auditorium.id
        if (!moviesMap.get(movieId).theatres.get(theatreId).auditoriums.has(auditoriumId)) {
          moviesMap.get(movieId).theatres.get(theatreId).auditoriums.set(auditoriumId, {
            auditorium: show.Auditorium,
            shows: []
          })
        }

        moviesMap.get(movieId).theatres.get(theatreId).auditoriums.get(auditoriumId).shows.push({
          id: show.id,
          show_datetime: show.show_datetime,
          pricing: show.pricing
        })
      })

      const movies = Array.from(moviesMap.values()).map(({ movie, theatres }) => ({
        ...movie.toJSON(),
        theatres: Array.from(theatres.values()).map(({ theatre, auditoriums }) => ({
          ...theatre.toJSON(),
          auditoriums: Array.from(auditoriums.values()).map(({ auditorium, shows }) => ({
            ...auditorium.toJSON(),
            shows
          }))
        }))
      }))

      return res.json({
        data: {
          movies,
          search_criteria: {
            query: q,
            city,
            genre,
            language,
            date
          },
          total_movies: movies.length
        },
        message: 'Search completed successfully'
      })
    } catch (err) {
      console.error(`[PublicController]-[searchMovies]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Movie search failed'
      })
    }
  }

  static async getAvailableCities(req, res) {
    try {
      const sequelize = req.db
      const Theatre = defineTheatre(sequelize)
      await Theatre.sync()

      const cities = await Theatre.findAll({
        attributes: [
          [sequelize.fn('DISTINCT', sequelize.col('city')), 'city']
        ],
        where: {
          city: { [Op.ne]: null }
        },
        order: [['city', 'ASC']]
      })

      return res.json({
        data: cities.map(c => c.city),
        message: 'Available cities retrieved successfully'
      })
    } catch (err) {
      console.error(`[PublicController]-[getAvailableCities]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve cities'
      })
    }
  }
}
