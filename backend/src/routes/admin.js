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
// BOOKING MANAGEMENT ROUTES
// ==============================

// Get all bookings for management
router.get('/bookings', 
  AdminController.getAllBookings
)

// Note: Status update functionality removed for simplicity

// ==============================
// BOOKED SEATS MANAGEMENT ROUTES
// ==============================

// Get all booked seats for management
router.get('/booked-seats', 
  AdminController.getAllBookedSeats
)

// Delete/release a booked seat
router.delete('/booked-seats/:seatId', 
  AdminController.deleteBookedSeat
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
