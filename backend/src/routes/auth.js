import { Router } from 'express'
import AuthController from '../controller/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
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
router.get('/cache/stats', authenticate, async (req, res) => {
  try {
    const stats = await TokenCacheService.getCacheStats()
    res.json({ data: stats, message: 'Cache statistics retrieved' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, message: 'Failed to get cache stats' })
  }
})

router.post('/cache/clear', authenticate, async (req, res) => {
  try {
    // Only allow super admin to clear cache
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: 'Only super admin can clear cache' })
    }
    
    await TokenCacheService.clearAllTokenCache()
    res.json({ message: 'Token cache cleared successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, message: 'Failed to clear cache' })
  }
})

export default router
