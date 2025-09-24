import { Router } from 'express'
import AuthController from '../controller/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

// Public routes
router.post('/super-admin/login', AuthController.superAdminLogin)
router.post('/admin/login', AuthController.adminLogin)
router.post('/refresh', AuthController.refresh)
router.post('/logout', AuthController.logout)

// Protected routes
router.get('/me', authenticate, AuthController.getCurrentUser)

export default router
