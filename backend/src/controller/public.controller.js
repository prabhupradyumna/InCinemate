import { HTTP_STATUS, API_MESSAGES } from '../constants.js'
import { Op } from 'sequelize'
import PricingService from '../services/pricing.service.js'
import { defineSeatPricing } from '../models/SeatPricing.js'

export default class PublicController {
  // ==============================
  // LOCATION-BASED MOVIE DISCOVERY
  // ==============================

  static async searchMoviesByLocation(req, res) {
    try {
      const { city, date, genre, language } = req.query

      // Use centralized models with pre-configured associations
      const { Movie, Show, Auditorium, Theatre } = req.models

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

      // Build movie filters - simplified for now
      const movieFilters = { is_active: true }
      // TODO: Add genre and language filtering once schema is confirmed
      // if (genre) movieFilters.genres = { [Op.contains]: [genre] }
      // if (language) movieFilters.languages = { [Op.contains]: [language] }

      // Find shows in the specified city (if provided)
      const shows = await Show.findAll({
        where: {
          ...dateFilter,
          status: { [Op.in]: ['scheduled', 'live'] }
        },
        include: [
          {
            model: Movie,
            as: 'Movie',
            where: movieFilters,
            attributes: ['id', 'title', 'poster_url', 'trailer_url', 'synopsis', 'genres', 'genres', 'duration_minutes', 'rating', 'languages']
          },
          {
            model: Auditorium,
            as: 'Auditorium',
            attributes: ['id', 'name'],
            required: false,
            include: [{
              model: Theatre,
              as: 'Theatre',
              where: city ? { city: { [Op.iLike]: `%${city}%` } } : {},
              attributes: ['id', 'name', 'address', 'city']
            , required: !!city }]
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

        const auditorium = show.Auditorium || null
        const theatre = auditorium?.Theatre || null

        if (auditorium && theatre) {
          const theatreId = theatre.id
          if (!moviesMap.get(movieId).theatres.has(theatreId)) {
            moviesMap.get(movieId).theatres.set(theatreId, {
              theatre,
              auditoriums: new Map()
            })
          }

          const auditoriumId = auditorium.id
          if (!moviesMap.get(movieId).theatres.get(theatreId).auditoriums.has(auditoriumId)) {
            moviesMap.get(movieId).theatres.get(theatreId).auditoriums.set(auditoriumId, {
              auditorium,
              shows: []
            })
          }

          moviesMap.get(movieId).theatres.get(theatreId).auditoriums.get(auditoriumId).shows.push({
            id: show.id,
            show_datetime: show.show_datetime,
            pricing: show.pricing
          })
        }
      })

      // Convert to response format for movies that have shows
      let movies = Array.from(moviesMap.values()).map(({ movie, theatres }) => ({
        ...movie.toJSON(),
        theatres: Array.from(theatres.values()).map(({ theatre, auditoriums }) => ({
          ...theatre.toJSON(),
          auditoriums: Array.from(auditoriums.values()).map(({ auditorium, shows }) => ({
            ...auditorium.toJSON(),
            shows
          }))
        }))
      }))

      // Fallback: include active movies without shows so they appear on homepage
      if (movies.length === 0) {
        const cityFilter = city ? { city: { [Op.iLike]: `%${city}%` } } : {}
        const fallbackMovies = await Movie.findAll({
          where: { ...movieFilters, ...cityFilter },
          attributes: ['id', 'title', 'poster_url', 'backdrop_url', 'trailer_url', 'synopsis', 'genres', 'duration_minutes', 'rating', 'platform_status', 'is_featured', 'is_trending']
        })
        movies = fallbackMovies.map(m => ({
          ...m.toJSON(),
          theatres: []
        }))
      }

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
      const { city, include_relations = 'true' } = req.query

      const sequelize = req.db

      // If relations are requested, use the helper function
      if (include_relations === 'true') {
        const { getMovieWithAllRelations } = await import('../models/MovieRelationships.js')
        const movieWithRelations = await getMovieWithAllRelations(sequelize, id)

        if (!movieWithRelations || !movieWithRelations.is_active) {
          return res.status(HTTP_STATUS.NOT_FOUND).json({
            success: false,
            error: 'Movie not found',
            message: 'Failed to retrieve movie details'
          })
        }

        // Get upcoming shows for this movie
        const { Movie, Show, Auditorium, Theatre } = req.models
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
              as: 'Auditorium',
              attributes: ['id', 'name'],
              include: [{
                model: Theatre,
                as: 'Theatre',
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
            movie: movieWithRelations.toJSON(),
            theatres,
            total_shows: shows.length
          },
          message: 'Movie details retrieved successfully'
        })
      }

      // Fallback: without relations
      const { Movie, Show, Auditorium, Theatre } = req.models

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
            as: 'Auditorium',
            attributes: ['id', 'name'],
            required: false,
            include: [{
              model: Theatre,
              as: 'Theatre',
              where: city ? { city: { [Op.iLike]: `%${city}%` } } : {},
              attributes: ['id', 'name', 'address', 'city'],
              required: !!city
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

      // Use centralized models with pre-configured associations
      const sequelize = req.db
      const { Show, Seat, Auditorium, Theatre, Movie, Booking, BookedSeat, SeatPricing } = req.models

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

      // Get pricing for all seats using the new pricing service
      const seatIds = allSeats.map(seat => seat.id)
      const pricingMap = await PricingService.resolvePricesForSeats({
        sequelize,
        models: { SeatPricing, Seat },
        seatIds,
        show,
        defaultPrice: 250
      })

      // Create seat map with availability status
      const seatMap = allSeats.map(seat => {
        let price = pricingMap.get(seat.id) || 250 // Default price
        
        // Fallback to show.pricing if seat_pricing doesn't have a price
        if (price === null && show.pricing) {
          if (show.pricing[seat.category]) {
            price = show.pricing[seat.category]
          } else if (show.pricing[`row_${seat.row}`]) {
            price = show.pricing[`row_${seat.row}`]
          }
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

      // Create pricing summary for frontend compatibility
      const pricingSummary = {}
      seatMap.forEach(seat => {
        if (!pricingSummary[seat.category]) {
          pricingSummary[seat.category] = seat.price
        }
      })

      return res.json({
        data: {
          show: {
            id: show.id,
            show_datetime: show.show_datetime,
            pricing: pricingSummary,
            movie: show.Movie,
            auditorium: show.Auditorium,
            theatre: show.Auditorium.Theatre
          },
          seat_map: seatsByRow,
          seats_flat: seatMap, // Include flat array for frontend compatibility
          statistics: {
            total_seats: show.Auditorium.total_seats || allSeats.length,
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

      // Use centralized models with pre-configured associations
      const { Show, Seat, Booking, BookedSeat, Coupon } = req.models

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

      // Calculate pricing using SeatPricing with fallback to Show.pricing
      const seatIds = seats.map(s => s.id)
      const resolvedMap = await PricingService.resolvePricesForSeats({
        sequelize,
        models: { SeatPricing: defineSeatPricing(sequelize) },
        seatIds,
        show,
        defaultPrice: 250
      })

      const seatPricing = []
      let subtotal = 0
      for (const seat of seats) {
        let price = resolvedMap.get(seat.id)
        if (price == null) {
          // fallback to show matrix
          if (show.pricing && show.pricing[seat.category] != null) price = show.pricing[seat.category]
          else if (show.pricing && show.pricing[`row_${seat.row}`] != null) price = show.pricing[`row_${seat.row}`]
          else price = 250
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

      // Use centralized models with pre-configured associations
      const { Movie, Show, Auditorium, Theatre } = req.models

      // Build search filters
      const movieFilters = {
        is_active: true,
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } }
          // Note: Cast search will be handled separately once cast relationships are properly set up
        ]
      }

      // TODO: Add genre and language filtering once schema is confirmed
      // if (genre) movieFilters.genres = { [Op.contains]: [genre] }
      // if (language) movieFilters.languages = { [Op.contains]: [language] }

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
            attributes: ['id', 'title', 'poster_url', 'trailer_url', 'synopsis', 'genres', 'genres', 'duration_minutes', 'rating', 'languages']
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
      // Use centralized models with pre-configured associations
      const { Theatre } = req.models
      const sequelize = req.db

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

  // ==============================
  // FEATURED & POPULAR MOVIES
  // ==============================

  static async getFeaturedMovies(req, res) {
    try {
      const { city, limit = 10 } = req.query
      
      // Use centralized models with pre-configured associations
      const { Movie, Show, Auditorium, Theatre } = req.models

      // Build filters for featured movies
      const movieFilters = {
        is_active: true,
        is_featured: true
      }

      let cityFilters = {}
      if (city) {
        cityFilters = { city: { [Op.iLike]: `%${city}%` } }
      }

      // Get featured movies with upcoming shows
      const shows = await Show.findAll({
        where: {
          show_datetime: { [Op.gte]: new Date() },
          status: { [Op.in]: ['scheduled', 'live'] }
        },
        include: [
          {
            model: Movie,
            as: 'Movie',
            where: movieFilters,
            attributes: ['id', 'title', 'poster_url', 'backdrop_url', 'trailer_url', 'synopsis', 'genres', 'duration_minutes', 'rating', 'platform_status', 'is_featured', 'is_trending']
          },
          {
            model: Auditorium,
            as: 'Auditorium',
            attributes: ['id', 'name'],
            required: false,
            include: [{
              model: Theatre,
              as: 'Theatre',
              where: cityFilters,
              attributes: ['id', 'name', 'city'],
              required: Object.keys(cityFilters).length > 0
            }]
          }
        ],
        order: [['show_datetime', 'ASC']],
        limit: parseInt(limit)
      })

      // Extract unique movies
      const uniqueMovies = []
      const movieIds = new Set()

      shows.forEach(show => {
        if (!movieIds.has(show.Movie.id)) {
          movieIds.add(show.Movie.id)
          uniqueMovies.push(show.Movie.toJSON())
        }
      })

      return res.json({
        data: uniqueMovies.slice(0, parseInt(limit)),
        message: 'Featured movies retrieved successfully'
      })
    } catch (err) {
      console.error(`[PublicController]-[getFeaturedMovies]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve featured movies'
      })
    }
  }

  static async getPopularMovies(req, res) {
    try {
      const { city, limit = 10, period = 'month' } = req.query
      const sequelize = req.db
      
      // Use centralized models with pre-configured associations
      const { Movie, Booking, Show, Auditorium, Theatre } = req.models

      // Calculate date range based on period
      let dateFilter = {}
      const now = new Date()
      if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFilter = { created_at: { [Op.gte]: weekAgo } }
      } else if (period === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        dateFilter = { created_at: { [Op.gte]: monthAgo } }
      }

      // Get popular movies based on booking count
      const popularMovies = await Movie.findAll({
        attributes: [
          'id', 'title', 'poster_url', 'backdrop_url', 'genres', 'duration_minutes', 'rating', 'platform_status', 'is_trending',
          [sequelize.fn('COUNT', sequelize.col('Shows.Bookings.id')), 'booking_count'],
          [sequelize.fn('SUM', sequelize.col('Shows.Bookings.total_price')), 'revenue']
        ],
        where: { is_active: true },
        include: [
          {
            model: Show,
            attributes: [],
            include: [
              {
                model: Booking,
                attributes: [],
                where: {
                  status: ['paid', 'pending'],
                  ...dateFilter
                },
                required: false
              },
              {
                model: Auditorium,
                attributes: [],
                include: [{
                  model: Theatre,
                  attributes: [],
                  where: city ? { city: { [Op.iLike]: `%${city}%` } } : {},
                  required: !!city
                }],
                required: !!city
              }
            ],
            required: false
          }
        ],
        group: ['Movie.id'],
        order: [[sequelize.literal('booking_count'), 'DESC']],
        limit: parseInt(limit)
      })

      return res.json({
        data: popularMovies.map(movie => ({
          ...movie.toJSON(),
          booking_count: parseInt(movie.dataValues.booking_count) || 0,
          revenue: parseFloat(movie.dataValues.revenue) || 0
        })),
        message: 'Popular movies retrieved successfully'
      })
    } catch (err) {
      console.error(`[PublicController]-[getPopularMovies]: ${err.message}`)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: err.message,
        message: 'Failed to retrieve popular movies'
      })
    }
  }
}
