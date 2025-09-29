import { Router } from 'express'
import CustomerController from '../controller/customer.controller.js'
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js'

const router = Router()

// All customer routes require authentication and customer role
router.use(authenticate)
router.use(authorizeRoles('customer'))

// ==============================
// BOOKING MANAGEMENT ROUTES
// ==============================

// Get my bookings
router.get('/bookings', CustomerController.getMyBookings)

// Get booking details
router.get('/bookings/:id', CustomerController.getBookingDetails)

// Cancel a booking
router.post('/bookings/:id/cancel', CustomerController.cancelBooking)

// ==============================
// SEAT HOLDING & BOOKING ROUTES
// ==============================

// Hold seats for a show
router.post('/bookings/hold-seats', CustomerController.holdSeats)

// Confirm booking with payment
router.post('/bookings/confirm', CustomerController.confirmBooking)

// ==============================
// COUPON ROUTES
// ==============================

// Validate a coupon
router.post('/coupons/validate', CustomerController.validateCoupon)

// Apply a coupon to booking
router.post('/coupons/apply', CustomerController.applyCoupon)

// ==============================
// PAYMENT ROUTES
// ==============================

// Get available payment methods
router.get('/payment-methods', CustomerController.getPaymentMethods)

export default router
