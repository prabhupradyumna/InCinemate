import { redisClient } from '../redis.js'
import inMemoryCache from './tokenCacheFallback.js'
import { REDIS_CONFIG } from '../constants.js'

// Token cache service for Redis-based access token management
export class TokenCacheService {
  // Cache key prefixes
  static ACCESS_TOKEN_PREFIX = REDIS_CONFIG.PREFIXES.ACCESS_TOKEN
  static USER_TOKENS_PREFIX = REDIS_CONFIG.PREFIXES.USER_TOKENS
  static BLACKLIST_PREFIX = REDIS_CONFIG.PREFIXES.BLACKLIST

  /**
   * Store access token in Redis with user info
   * @param {string} token - JWT access token
   * @param {object} userInfo - User information to cache
   * @param {number} ttlSeconds - Time to live in seconds (default: 30 minutes)
   */
  static async storeAccessToken(token, userInfo, ttlSeconds = REDIS_CONFIG.TTL.ACCESS_TOKEN_SECONDS) {
    try {
      // Check if Redis is available
      if (!redisClient.isOpen) {
        console.log('[tokenCache] Redis not available, using in-memory fallback')
        return await inMemoryCache.storeAccessToken(token, userInfo, ttlSeconds)
      }

      const tokenKey = `${this.ACCESS_TOKEN_PREFIX}${token}`
      const userTokensKey = `${this.USER_TOKENS_PREFIX}${userInfo.userId}`
      
      // Store token with user info
      await redisClient.setEx(tokenKey, ttlSeconds, JSON.stringify(userInfo))
      
      // Track user's active tokens (for logout all sessions)
      await redisClient.sAdd(userTokensKey, token)
      await redisClient.expire(userTokensKey, ttlSeconds)
      
      console.log(`[tokenCache] Stored access token for user ${userInfo.userId}`)
      return true
    } catch (error) {
      console.error('[tokenCache] Redis error, falling back to in-memory cache:', error.message)
      return await inMemoryCache.storeAccessToken(token, userInfo, ttlSeconds)
    }
  }

  /**
   * Retrieve user info from cached access token
   * @param {string} token - JWT access token
   * @returns {object|null} User information or null if not found
   */
  static async getAccessTokenInfo(token) {
    try {
      // Check if Redis is available
      if (!redisClient.isOpen) {
        return await inMemoryCache.getAccessTokenInfo(token)
      }

      const tokenKey = `${this.ACCESS_TOKEN_PREFIX}${token}`
      const cachedData = await redisClient.get(tokenKey)
      
      if (cachedData) {
        const userInfo = JSON.parse(cachedData)
        console.log(`[tokenCache] Retrieved cached token info for user ${userInfo.userId}`)
        return userInfo
      }
      
      return null
    } catch (error) {
      console.error('[tokenCache] Redis error, falling back to in-memory cache:', error.message)
      return await inMemoryCache.getAccessTokenInfo(token)
    }
  }

  /**
   * Check if token is blacklisted
   * @param {string} token - JWT access token
   * @returns {boolean} True if token is blacklisted
   */
  static async isTokenBlacklisted(token) {
    try {
      // Check if Redis is available
      if (!redisClient.isOpen) {
        return await inMemoryCache.isTokenBlacklisted(token)
      }

      const blacklistKey = `${this.BLACKLIST_PREFIX}${token}`
      const exists = await redisClient.exists(blacklistKey)
      return exists === 1
    } catch (error) {
      console.error('[tokenCache] Redis error, falling back to in-memory cache:', error.message)
      return await inMemoryCache.isTokenBlacklisted(token)
    }
  }

  /**
   * Blacklist a token (for logout)
   * @param {string} token - JWT access token
   * @param {number} ttlSeconds - Time to keep in blacklist (default: token expiry)
   */
  static async blacklistToken(token, ttlSeconds = REDIS_CONFIG.TTL.BLACKLIST_SECONDS) {
    try {
      // Check if Redis is available
      if (!redisClient.isOpen) {
        return await inMemoryCache.blacklistToken(token, ttlSeconds)
      }

      const blacklistKey = `${this.BLACKLIST_PREFIX}${token}`
      await redisClient.setEx(blacklistKey, ttlSeconds, '1')
      console.log(`[tokenCache] Blacklisted token`)
      return true
    } catch (error) {
      console.error('[tokenCache] Redis error, falling back to in-memory cache:', error.message)
      return await inMemoryCache.blacklistToken(token, ttlSeconds)
    }
  }

  /**
   * Remove access token from cache
   * @param {string} token - JWT access token
   */
  static async removeAccessToken(token) {
    try {
      const tokenKey = `${this.ACCESS_TOKEN_PREFIX}${token}`
      await redisClient.del(tokenKey)
      console.log(`[tokenCache] Removed access token from cache`)
      return true
    } catch (error) {
      console.error('[tokenCache] Error removing access token:', error)
      return false
    }
  }

  /**
   * Logout user from all sessions (remove all their tokens)
   * @param {string} userId - User ID
   */
  static async logoutAllUserSessions(userId) {
    try {
      const userTokensKey = `${this.USER_TOKENS_PREFIX}${userId}`
      const tokens = await redisClient.sMembers(userTokensKey)
      
      if (tokens && tokens.length > 0) {
        // Blacklist all tokens
        const pipeline = redisClient.multi()
        tokens.forEach(token => {
          const blacklistKey = `${this.BLACKLIST_PREFIX}${token}`
          const tokenKey = `${this.ACCESS_TOKEN_PREFIX}${token}`
          pipeline.setEx(blacklistKey, 1800, '1') // 30 minutes blacklist
          pipeline.del(tokenKey)
        })
        pipeline.del(userTokensKey)
        await pipeline.exec()
        
        console.log(`[tokenCache] Logged out user ${userId} from ${tokens.length} sessions`)
      }
      
      return true
    } catch (error) {
      console.error('[tokenCache] Error logging out all user sessions:', error)
      return false
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  static async getCacheStats() {
    try {
      const accessTokenKeys = await redisClient.keys(`${this.ACCESS_TOKEN_PREFIX}*`)
      const userTokenKeys = await redisClient.keys(`${this.USER_TOKENS_PREFIX}*`)
      const blacklistKeys = await redisClient.keys(`${this.BLACKLIST_PREFIX}*`)
      
      return {
        activeTokens: accessTokenKeys.length,
        activeUsers: userTokenKeys.length,
        blacklistedTokens: blacklistKeys.length
      }
    } catch (error) {
      console.error('[tokenCache] Error getting cache stats:', error)
      return { activeTokens: 0, activeUsers: 0, blacklistedTokens: 0 }
    }
  }

  /**
   * Clear all token cache (for testing/maintenance)
   */
  static async clearAllTokenCache() {
    try {
      const accessTokenKeys = await redisClient.keys(`${this.ACCESS_TOKEN_PREFIX}*`)
      const userTokenKeys = await redisClient.keys(`${this.USER_TOKENS_PREFIX}*`)
      const blacklistKeys = await redisClient.keys(`${this.BLACKLIST_PREFIX}*`)
      
      const allKeys = [...accessTokenKeys, ...userTokenKeys, ...blacklistKeys]
      
      if (allKeys.length > 0) {
        await redisClient.del(allKeys)
        console.log(`[tokenCache] Cleared ${allKeys.length} token cache entries`)
      }
      
      return true
    } catch (error) {
      console.error('[tokenCache] Error clearing token cache:', error)
      return false
    }
  }
}

export default TokenCacheService
