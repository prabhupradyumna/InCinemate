import { createClient } from 'redis'

// Redis configuration
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 2000, // 2 seconds connection timeout
    commandTimeout: 1000, // 1 second command timeout
    reconnectStrategy: (retries) => {
      if (retries > 3) {
        console.log('[redis] Max retries reached, giving up')
        return false // Stop retrying after 3 attempts
      }
      return Math.min(retries * 100, 1000) // Max 1 second between retries
    }
  }
}

// Create Redis client
export const redisClient = createClient(redisConfig)

// Redis connection event handlers
redisClient.on('error', (err) => {
  console.error('[redis] Redis Client Error:', err)
})

redisClient.on('connect', () => {
  console.log('[redis] Redis Client Connected')
})

redisClient.on('ready', () => {
  console.log('[redis] Redis Client Ready')
})

redisClient.on('end', () => {
  console.log('[redis] Redis Client Disconnected')
})

// Connect to Redis with timeout
export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      // Add timeout to prevent hanging
      const connectPromise = redisClient.connect()
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout after 3 seconds')), 3000)
      )
      
      await Promise.race([connectPromise, timeoutPromise])
    }
    console.log('[redis] Connected to Redis successfully')
  } catch (error) {
    console.error('[redis] Failed to connect to Redis:', error.message)
    throw error
  }
}

// Graceful shutdown
export const disconnectRedis = async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit()
    }
    console.log('[redis] Redis connection closed')
  } catch (error) {
    console.error('[redis] Error closing Redis connection:', error)
  }
}

export default redisClient
