import { Router } from 'express'
import AuthController from '../controller/auth.controller.js'
import { authenticate, authorizeRoles } from '../middleware/auth.middleware.js'
import TokenCacheService from '../services/tokenCache.js'

const router = Router()

// Public routes
router.post('/super-admin/login', AuthController.superAdminLogin)
router.post('/admin/login', AuthController.adminLogin)
router.post('/refresh', AuthController.refresh)
router.post('/logout', AuthController.logout)

// Protected routes
router.get('/me', authenticate, AuthController.getCurrentUser)

// Cache management routes (admin only)
router.get('/cache/stats', authenticate, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const stats = await TokenCacheService.getCacheStats()
    res.json({ data: stats, message: 'Cache statistics retrieved' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, message: 'Failed to get cache stats' })
  }
})

router.post('/cache/clear', authenticate, authorizeRoles('super_admin'), async (req, res) => {
  try {
    await TokenCacheService.clearAllTokenCache()
    res.json({ message: 'Token cache cleared successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, message: 'Failed to clear cache' })
  }
})

export default router
