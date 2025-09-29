import { Router } from 'express'
import AdminController from '../controller/admin.controller.js'
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js'
import { requirePermission } from '../middleware/permission.middleware.js'

const router = Router()

// All admin routes require authentication and admin role
router.use(authenticate)
router.use(authorizeRoles('admin'))

// ==============================
// AUDITORIUM REQUEST ROUTES
// ==============================

// Submit auditorium request
router.post('/auditorium-requests', 
  requirePermission('Manage Auditoriums'),
  AdminController.submitAuditoriumRequest
)

// Get my auditorium requests
router.get('/auditorium-requests', 
  requirePermission('Manage Auditoriums'),
  AdminController.getMyAuditoriumRequests
)

// ==============================
// MOVIE MANAGEMENT ROUTES
// ==============================

// Create a new movie
router.post('/movies', 
  requirePermission('Manage Movies'),
  AdminController.createMovie
)

// List all movies
router.get('/movies', 
  requirePermission('Manage Movies'),
  AdminController.listMovies
)

// Update movie details
router.put('/movies/:id', 
  requirePermission('Manage Movies'),
  AdminController.updateMovie
)

// ==============================
// SHOW MANAGEMENT ROUTES
// ==============================

// Schedule a new show
router.post('/shows', 
  requirePermission('Manage Shows'),
  AdminController.scheduleShow
)

// List all shows
router.get('/shows', 
  requirePermission('Manage Shows'),
  AdminController.listShows
)

// ==============================
// COUPON MANAGEMENT ROUTES
// ==============================

// Create a new coupon
router.post('/coupons', 
  requirePermission('Manage Coupons'),
  AdminController.createCoupon
)

// List all coupons
router.get('/coupons', 
  requirePermission('Manage Coupons'),
  AdminController.listCoupons
)

// ==============================
// LIVE OPERATIONS ROUTES
// ==============================

// Get live dashboard for a show
router.get('/shows/:show_id/live', 
  requirePermission('View Reports'),
  AdminController.getLiveDashboard
)

// ==============================
// STAFF MANAGEMENT ROUTES
// ==============================

// Create ticket checker account
router.post('/ticket-checkers', 
  requirePermission('Manage Staff'),
  AdminController.createTicketChecker
)

// List ticket checkers
router.get('/ticket-checkers', 
  requirePermission('Manage Staff'),
  AdminController.listTicketCheckers
)

export default router
