import { Router } from 'express'
import PublicController from '../controller/public.controller.js'

const router = Router()

// ==============================
// MOVIE DISCOVERY ROUTES (PUBLIC)
// ==============================

// Search movies by location
router.get('/movies', PublicController.searchMoviesByLocation)

// Get featured movies - MUST be before /movies/:id route
router.get('/movies/featured', PublicController.getFeaturedMovies)

// Get popular movies
router.get('/analytics/popular-movies', PublicController.getPopularMovies)

// Get movie details with showtimes - MUST be after specific routes
router.get('/movies/:id', PublicController.getMovieDetails)

// Search movies by query (title, cast, etc.)
router.get('/search', PublicController.searchMovies)

// Get available cities
router.get('/cities', PublicController.getAvailableCities)

// ==============================
// SEAT MAP ROUTES (PUBLIC)
// ==============================

// Get seat map for a show
router.get('/shows/:show_id/seats', PublicController.getSeatMap)

// ==============================
// GUEST BOOKING ROUTES (PUBLIC)
// ==============================

// Create guest booking (no authentication required)
router.post('/bookings', PublicController.createGuestBooking)

// Create seat reservation (no authentication required)
router.post('/create-seat-reservation', PublicController.createSeatReservation)

export default router
