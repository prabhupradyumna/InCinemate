import { Router } from 'express'
import SuperadminController from '../controller/superadmin.controller.js'
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js'
import * as permissionMiddleware from '../middleware/permission.middleware.js'

const { requirePermission } = permissionMiddleware

const router = Router()

// All routes require super admin authentication and authorization
router.use(authenticate)
router.use(authorizeRoles('super_admin'))

// ==============================
// ADMIN MANAGEMENT ROUTES
// ==============================

// Create a new admin account
router.post('/admins', SuperadminController.createAdmin)

// List all admin accounts
router.get('/admins', SuperadminController.listAdmins)

// Update admin details
router.put('/admins/:id', SuperadminController.updateAdmin)

// ==============================
// PERMISSION MANAGEMENT ROUTES
// ==============================

// List all available permissions
router.get('/permissions', SuperadminController.listPermissions)

// Get admin's current permissions
router.get('/admins/:id/permissions', SuperadminController.getAdminPermissions)

// Update admin permissions
router.put('/admins/:id/permissions', SuperadminController.updateAdminPermissions)

// ==============================
// THEATRE MANAGEMENT ROUTES
// ==============================

// Create a new theatre
router.post('/theatres', SuperadminController.createTheatre)

// List all theatres
router.get('/theatres', SuperadminController.listTheatres)

// Auditoriums listing for superadmin (manage across theatres)
router.get('/auditoriums', SuperadminController.listAuditoriums)
router.get('/auditoriums/:id', SuperadminController.getAuditorium)
router.get('/auditoriums/:id/seats', SuperadminController.getAuditoriumSeats)
router.put('/auditoriums/:id', SuperadminController.updateAuditoriumConfiguration)
// Base seat pricing bulk update and preview
router.put('/auditoriums/:auditorium_id/seat-pricing/base', SuperadminController.bulkUpdateBaseSeatPricing)
router.get('/auditoriums/:auditorium_id/seat-pricing/preview', SuperadminController.getAuditoriumPricingPreview)

// Show-specific seat pricing
router.put('/shows/:show_id/seat-pricing', SuperadminController.bulkUpdateShowSeatPricing)

// ==============================
// TENANT MANAGEMENT ROUTES
// ==============================

// Create or ensure tenant exists
router.post('/tenants', SuperadminController.createTenant)

// List tenants
router.get('/tenants', SuperadminController.listTenants)

// ==============================
// AUDITORIUM REQUEST MANAGEMENT ROUTES
// ==============================

// List all auditorium requests
router.get('/auditorium-requests', SuperadminController.listAuditoriumRequests)

// Get specific auditorium request
router.get('/auditorium-requests/:id', SuperadminController.getAuditoriumRequest)

// Update auditorium request status (approve/reject)
router.put('/auditorium-requests/:id/status', SuperadminController.updateAuditoriumRequestStatus)

// ==============================
// AUDITORIUM CONFIGURATION ROUTES
// ==============================

// Create auditorium configuration from approved request
router.post('/auditoriums/configure', SuperadminController.createAuditoriumConfiguration)

// ==============================
// ENHANCED MOVIE MANAGEMENT ROUTES (SUPERADMIN)
// ==============================

// Create a new movie
router.post('/movies', 
  requirePermission('Manage Movies'),
  SuperadminController.createMovie
)

// List all movies (with advanced filtering and search)
router.get('/movies', 
  requirePermission('Manage Movies'),
  SuperadminController.listMovies
)

// Get single movie with all relations
router.get('/movies/:id', 
  requirePermission('Manage Movies'),
  SuperadminController.getMovie
)

// Update movie details
router.put('/movies/:id', 
  requirePermission('Manage Movies'),
  SuperadminController.updateMovie
)

// Delete movie
router.delete('/movies/:id',
  requirePermission('Manage Movies'),
  SuperadminController.deleteMovie
)

// Bulk update movie status
router.patch('/movies/bulk-update',
  requirePermission('Manage Movies'),
  SuperadminController.bulkUpdateMovieStatus
)

// ==============================
// MOVIE CAST MANAGEMENT ROUTES
// ==============================

// Add cast member to movie
router.post('/movies/:movieId/cast',
  requirePermission('Manage Movies'),
  SuperadminController.addMovieCast
)

// Remove cast member from movie
router.delete('/movies/:movieId/cast/:castId',
  requirePermission('Manage Movies'),
  SuperadminController.removeMovieCast
)

// Update cast member
router.put('/movies/:movieId/cast/:castId',
  requirePermission('Manage Movies'),
  SuperadminController.updateMovieCast
)

// ==============================
// MOVIE CREW MANAGEMENT ROUTES
// ==============================

// Add crew member to movie
router.post('/movies/:movieId/crew',
  requirePermission('Manage Movies'),
  SuperadminController.addMovieCrew
)

// Remove crew member from movie
router.delete('/movies/:movieId/crew/:crewId',
  requirePermission('Manage Movies'),
  SuperadminController.removeMovieCrew
)

// Update crew member
router.put('/movies/:movieId/crew/:crewId',
  requirePermission('Manage Movies'),
  SuperadminController.updateMovieCrew
)

// ==============================
// MOVIE REVIEWS MANAGEMENT ROUTES
// ==============================

// Add review to movie
router.post('/movies/:movieId/reviews',
  requirePermission('Manage Movies'),
  SuperadminController.addMovieReview
)

// ==============================
// ACTOR MANAGEMENT ROUTES
// ==============================

// Create a new actor
router.post('/actors',
  requirePermission('Manage Movies'),
  SuperadminController.createActor
)

// List all actors
router.get('/actors',
  requirePermission('Manage Movies'),
  SuperadminController.listActors
)

// ==============================
// CREW PERSON MANAGEMENT ROUTES
// ==============================

// Create a new crew person
router.post('/crew-persons',
  requirePermission('Manage Movies'),
  SuperadminController.createCrewPerson
)

// List all crew persons
router.get('/crew-persons',
  requirePermission('Manage Movies'),
  SuperadminController.listCrewPersons
)

// Update crew person
router.put('/crew-persons/:id',
  requirePermission('Manage Movies'),
  SuperadminController.updateCrewPerson
)

export default router
