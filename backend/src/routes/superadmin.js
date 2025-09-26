import { Router } from 'express'
import SuperadminController from '../controller/superadmin.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

// All routes require super admin authentication
router.use(authenticate)

// Middleware to ensure only super admin can access these routes
router.use((req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied. Super admin role required.',
      message: 'Forbidden'
    })
  }
  next()
})

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

// ==============================
// AUDITORIUM REQUEST MANAGEMENT ROUTES
// ==============================

// List all auditorium requests
router.get('/auditorium-requests', SuperadminController.listAuditoriumRequests)

// Update auditorium request status (approve/reject)
router.put('/auditorium-requests/:id/status', SuperadminController.updateAuditoriumRequestStatus)

export default router
