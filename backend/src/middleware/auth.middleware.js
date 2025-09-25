import { verifyToken } from '../util/auth.util.js'
import TokenCacheService from '../services/tokenCache.js'

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }
  
  try {
    // First check if token is blacklisted
    const isBlacklisted = await TokenCacheService.isTokenBlacklisted(token)
    if (isBlacklisted) {
      return res.status(401).json({ success: false, message: 'Token has been revoked' })
    }

    // Try to get user info from Redis cache first
    let userInfo = await TokenCacheService.getAccessTokenInfo(token)
    
    if (!userInfo) {
      // Fallback to JWT verification if not in cache
      const user = verifyToken(token)
      userInfo = {
        userId: user.userId,
        email: user.email,
        role: user.role || null,
        tenantId: user.tenantId || null,
      }
      
      // Cache the token for future requests
      await TokenCacheService.storeAccessToken(token, userInfo)
    }
    
    req.user = userInfo
    next()
  } catch (err) {
    console.log('❌ Token Verification Error:', err.message)
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

export const authorizeRoles = (...roles) => (req, res, next) => {
  const userRole = req.user.role
  
  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' })
  }
  
  next()
}
