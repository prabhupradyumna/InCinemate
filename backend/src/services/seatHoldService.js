import { redisClient } from '../redis.js'
import inMemoryCache from './tokenCacheFallback.js'
import { REDIS_CONFIG } from '../constants.js'

/**
 * Seat Hold Service for managing temporary seat reservations
 * Uses Redis for distributed seat holding across multiple instances
 */
export class SeatHoldService {
  // Cache key prefixes
  static SEAT_HOLD_PREFIX = 'seat_hold:'
  static SEAT_AVAILABILITY_PREFIX = 'seat_availability:'
  static SHOW_SEATS_PREFIX = 'show_seats:'

  /**
   * Hold seats for a specific show
   * @param {string} showId - Show ID
   * @param {string[]} seatIds - Array of seat IDs to hold
   * @param {string} customerId - Customer ID (optional for guest bookings)
   * @param {number} holdDurationSeconds - Hold duration in seconds (default: 15 minutes)
   * @returns {Promise<{holdId: string, expiresAt: Date}>}
   */
  static async holdSeats(showId, seatIds, customerId = null, holdDurationSeconds = 900) {
    try {
      // Check if Redis is available
      if (!redisClient.isOpen) {
        console.log('[seatHold] Redis not available, using in-memory fallback')
        return await this.holdSeatsInMemory(showId, seatIds, customerId, holdDurationSeconds)
      }

      const holdId = `hold_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
      const holdKey = `${this.SEAT_HOLD_PREFIX}${holdId}`
      const showSeatsKey = `${this.SHOW_SEATS_PREFIX}${showId}`
      
      // Check if seats are available
      const unavailableSeats = await this.getUnavailableSeats(showId, seatIds)
      if (unavailableSeats.length > 0) {
        throw new Error(`Seats ${unavailableSeats.join(', ')} are not available`)
      }

      // Create hold data
      const holdData = {
        holdId,
        showId,
        seatIds,
        customerId,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + holdDurationSeconds * 1000).toISOString()
      }

      // Store hold in Redis
      await redisClient.setEx(holdKey, holdDurationSeconds, JSON.stringify(holdData))
      
      // Add seats to show's held seats set
      await Promise.all(
        seatIds.map(seatId => 
          redisClient.sAdd(showSeatsKey, seatId)
        )
      )
      await redisClient.expire(showSeatsKey, holdDurationSeconds)

      console.log(`[seatHold] Held ${seatIds.length} seats for show ${showId}, holdId: ${holdId}`)
      
      return {
        holdId,
        expiresAt: new Date(holdData.expiresAt)
      }
    } catch (error) {
      console.error('[seatHold] Redis error, falling back to in-memory cache:', error.message)
      return await this.holdSeatsInMemory(showId, seatIds, customerId, holdDurationSeconds)
    }
  }

  /**
   * Release held seats
   * @param {string} holdId - Hold ID to release
   * @returns {Promise<boolean>}
   */
  static async releaseSeats(holdId) {
    try {
      if (!redisClient.isOpen) {
        return await this.releaseSeatsInMemory(holdId)
      }

      const holdKey = `${this.SEAT_HOLD_PREFIX}${holdId}`
      const holdData = await redisClient.get(holdKey)
      
      if (!holdData) {
        return false // Hold not found or already expired
      }

      const hold = JSON.parse(holdData)
      const showSeatsKey = `${this.SHOW_SEATS_PREFIX}${hold.showId}`
      
      // Remove seats from held seats set
      await Promise.all(
        hold.seatIds.map(seatId => 
          redisClient.sRem(showSeatsKey, seatId)
        )
      )
      
      // Delete hold record
      await redisClient.del(holdKey)
      
      console.log(`[seatHold] Released hold ${holdId} for ${hold.seatIds.length} seats`)
      return true
    } catch (error) {
      console.error('[seatHold] Redis error:', error.message)
      return await this.releaseSeatsInMemory(holdId)
    }
  }

  /**
   * Get hold information
   * @param {string} holdId - Hold ID
   * @returns {Promise<object|null>}
   */
  static async getHoldInfo(holdId) {
    try {
      if (!redisClient.isOpen) {
        return await this.getHoldInfoInMemory(holdId)
      }

      const holdKey = `${this.SEAT_HOLD_PREFIX}${holdId}`
      const holdData = await redisClient.get(holdKey)
      
      if (!holdData) {
        return null
      }

      return JSON.parse(holdData)
    } catch (error) {
      console.error('[seatHold] Redis error:', error.message)
      return await this.getHoldInfoInMemory(holdId)
    }
  }

  /**
   * Check if seats are available for a show
   * @param {string} showId - Show ID
   * @param {string[]} seatIds - Array of seat IDs to check
   * @returns {Promise<string[]>} Array of unavailable seat IDs
   */
  static async getUnavailableSeats(showId, seatIds) {
    try {
      if (!redisClient.isOpen) {
        return await this.getUnavailableSeatsInMemory(showId, seatIds)
      }

      const showSeatsKey = `${this.SHOW_SEATS_PREFIX}${showId}`
      const unavailableSeats = []
      
      for (const seatId of seatIds) {
        const isHeld = await redisClient.sIsMember(showSeatsKey, seatId)
        if (isHeld) {
          unavailableSeats.push(seatId)
        }
      }
      
      return unavailableSeats
    } catch (error) {
      console.error('[seatHold] Redis error:', error.message)
      return await this.getUnavailableSeatsInMemory(showId, seatIds)
    }
  }

  /**
   * Get all held seats for a show
   * @param {string} showId - Show ID
   * @returns {Promise<string[]>} Array of held seat IDs
   */
  static async getHeldSeats(showId) {
    try {
      if (!redisClient.isOpen) {
        return await this.getHeldSeatsInMemory(showId)
      }

      const showSeatsKey = `${this.SHOW_SEATS_PREFIX}${showId}`
      const heldSeats = await redisClient.sMembers(showSeatsKey)
      
      return heldSeats || []
    } catch (error) {
      console.error('[seatHold] Redis error:', error.message)
      return await this.getHeldSeatsInMemory(showId)
    }
  }

  /**
   * Clean up expired holds (should be called periodically)
   * @returns {Promise<number>} Number of expired holds cleaned up
   */
  static async cleanupExpiredHolds() {
    try {
      if (!redisClient.isOpen) {
        return await this.cleanupExpiredHoldsInMemory()
      }

      const holdKeys = await redisClient.keys(`${this.SEAT_HOLD_PREFIX}*`)
      let cleanedCount = 0
      
      for (const holdKey of holdKeys) {
        const holdData = await redisClient.get(holdKey)
        if (holdData) {
          const hold = JSON.parse(holdData)
          const expiresAt = new Date(hold.expiresAt)
          
          if (expiresAt < new Date()) {
            await this.releaseSeats(hold.holdId)
            cleanedCount++
          }
        }
      }
      
      console.log(`[seatHold] Cleaned up ${cleanedCount} expired holds`)
      return cleanedCount
    } catch (error) {
      console.error('[seatHold] Redis error during cleanup:', error.message)
      return await this.cleanupExpiredHoldsInMemory()
    }
  }

  // ==============================
  // IN-MEMORY FALLBACK METHODS
  // ==============================

  static async holdSeatsInMemory(showId, seatIds, customerId, holdDurationSeconds) {
    const holdId = `hold_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
    const holdData = {
      holdId,
      showId,
      seatIds,
      customerId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + holdDurationSeconds * 1000).toISOString()
    }

    // Store in in-memory cache
    await inMemoryCache.storeAccessToken(holdId, holdData, holdDurationSeconds)
    
    return {
      holdId,
      expiresAt: new Date(holdData.expiresAt)
    }
  }

  static async releaseSeatsInMemory(holdId) {
    return await inMemoryCache.removeAccessToken(holdId)
  }

  static async getHoldInfoInMemory(holdId) {
    return await inMemoryCache.getAccessTokenInfo(holdId)
  }

  static async getUnavailableSeatsInMemory(showId, seatIds) {
    // In-memory implementation would need to track held seats
    // For now, return empty array (seats are always available)
    return []
  }

  static async getHeldSeatsInMemory(showId) {
    // In-memory implementation would need to track held seats
    // For now, return empty array
    return []
  }

  static async cleanupExpiredHoldsInMemory() {
    // In-memory cleanup would be handled by the fallback cache
    return 0
  }
}

export default SeatHoldService
