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
// MOVIE MANAGEMENT ROUTES (SUPERADMIN)
// ==============================

// Create a new movie
router.post('/movies', 
  requirePermission('Manage Movies'),
  SuperadminController.createMovie
)

// List all movies
router.get('/movies', 
  requirePermission('Manage Movies'),
  SuperadminController.listMovies
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

export default router
