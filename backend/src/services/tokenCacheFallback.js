/**
 * Fallback token cache service when Redis is not available
 * Uses in-memory storage as a temporary solution
 */

class InMemoryTokenCache {
  constructor() {
    this.cache = new Map()
    this.blacklist = new Set()
    this.userTokens = new Map()
  }

  async storeAccessToken(token, userInfo, ttlSeconds = 1800) { // 30 minutes default
    try {
      const expiry = Date.now() + (ttlSeconds * 1000)
      this.cache.set(token, { userInfo, expiry })
      
      // Track user's active tokens
      if (!this.userTokens.has(userInfo.userId)) {
        this.userTokens.set(userInfo.userId, new Set())
      }
      this.userTokens.get(userInfo.userId).add(token)
      
      // Auto-cleanup expired tokens
      this.cleanupExpiredTokens()
      
      console.log(`[tokenCacheFallback] Stored access token for user ${userInfo.userId}`)
      return true
    } catch (error) {
      console.error('[tokenCacheFallback] Error storing access token:', error)
      return false
    }
  }

  async getAccessTokenInfo(token) {
    try {
      const cached = this.cache.get(token)
      if (cached && cached.expiry > Date.now()) {
        console.log(`[tokenCacheFallback] Retrieved cached token info`)
        return cached.userInfo
      }
      
      // Remove expired token
      if (cached) {
        this.cache.delete(token)
      }
      
      return null
    } catch (error) {
      console.error('[tokenCacheFallback] Error retrieving access token:', error)
      return null
    }
  }

  async isTokenBlacklisted(token) {
    try {
      return this.blacklist.has(token)
    } catch (error) {
      console.error('[tokenCacheFallback] Error checking token blacklist:', error)
      return false
    }
  }

  async blacklistToken(token, ttlSeconds = 1800) { // 30 minutes default
    try {
      this.blacklist.add(token)
      
      // Auto-remove from blacklist after TTL
      setTimeout(() => {
        this.blacklist.delete(token)
      }, ttlSeconds * 1000)
      
      console.log(`[tokenCacheFallback] Blacklisted token`)
      return true
    } catch (error) {
      console.error('[tokenCacheFallback] Error blacklisting token:', error)
      return false
    }
  }

  async removeAccessToken(token) {
    try {
      this.cache.delete(token)
      console.log(`[tokenCacheFallback] Removed access token from cache`)
      return true
    } catch (error) {
      console.error('[tokenCacheFallback] Error removing access token:', error)
      return false
    }
  }

  async logoutAllUserSessions(userId) {
    try {
      const userTokenSet = this.userTokens.get(userId)
      if (userTokenSet) {
        userTokenSet.forEach(token => {
          this.blacklist.add(token)
          this.cache.delete(token)
        })
        this.userTokens.delete(userId)
        console.log(`[tokenCacheFallback] Logged out user ${userId} from ${userTokenSet.size} sessions`)
      }
      return true
    } catch (error) {
      console.error('[tokenCacheFallback] Error logging out all user sessions:', error)
      return false
    }
  }

  async getCacheStats() {
    try {
      this.cleanupExpiredTokens()
      return {
        activeTokens: this.cache.size,
        activeUsers: this.userTokens.size,
        blacklistedTokens: this.blacklist.size
      }
    } catch (error) {
      console.error('[tokenCacheFallback] Error getting cache stats:', error)
      return { activeTokens: 0, activeUsers: 0, blacklistedTokens: 0 }
    }
  }

  async clearAllTokenCache() {
    try {
      this.cache.clear()
      this.blacklist.clear()
      this.userTokens.clear()
      console.log(`[tokenCacheFallback] Cleared all token cache`)
      return true
    } catch (error) {
      console.error('[tokenCacheFallback] Error clearing token cache:', error)
      return false
    }
  }

  cleanupExpiredTokens() {
    const now = Date.now()
    for (const [token, data] of this.cache.entries()) {
      if (data.expiry <= now) {
        this.cache.delete(token)
      }
    }
  }
}

// Create singleton instance
const inMemoryCache = new InMemoryTokenCache()

export default inMemoryCache
