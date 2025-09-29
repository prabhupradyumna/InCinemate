import { Router } from 'express'
import PublicController from '../controller/public.controller.js'

const router = Router()

// ==============================
// MOVIE DISCOVERY ROUTES (PUBLIC)
// ==============================

// Search movies by location
router.get('/movies', PublicController.searchMoviesByLocation)

// Get movie details with showtimes
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

export default router
