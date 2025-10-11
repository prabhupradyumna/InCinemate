import { verifyToken } from '../util/auth.util.js'
import TokenCacheService from '../services/tokenCache.js'

export const authenticate = async (req, res, next) => {
  console.log('[Auth] Starting authentication middleware...')
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
  
  console.log('[Auth] Token present:', token ? 'YES' : 'NO')
  
  if (!token) {
    console.log('[Auth] No token provided, returning 401')
    return res.status(401).json({ success: false, message: 'No token provided' })
  }
  
  try {
    console.log('[Auth] Skipping Redis cache for debugging - using JWT verification directly')
    // Temporarily bypass Redis cache to debug timeout issue
    let userInfo;
    try {
      const user = verifyToken(token)
      userInfo = {
        userId: user.userId,
        email: user.email,
        role: user.role || null,
        tenantId: user.tenantId || null,
      }
      console.log('[Auth] JWT verification successful for user:', userInfo.userId)
    } catch (jwtError) {
      console.log('[Auth] JWT verification failed:', jwtError.message)
      return res.status(401).json({ success: false, message: 'Invalid token' })
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
