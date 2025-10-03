import 'dotenv/config'
import app from './app.js'
import { sequelize } from './db.js'
import { connectRedis, disconnectRedis } from './redis.js'
import { SERVER_CONFIG, DATABASE_CONFIG } from './constants.js'

// Optionally auto-sync schema in controlled environments (DISABLED for now)
// if (DATABASE_CONFIG.SYNC.ALTER) {
//   sequelize
//     .sync({ alter: true })
//     .then(() => console.log('[db] sync alter completed'))
//     .catch((e) => console.error('[db] sync alter failed', e))
// }

// Initialize Redis connection
const initializeServer = async () => {
  try {
    // Try to connect to Redis (optional)
    try {
      await connectRedis()
      console.log('[server] Redis connected successfully')
    } catch (redisError) {
      console.warn('[server] Redis connection failed, using in-memory fallback:', redisError.message)
      console.log('[server] Application will continue with in-memory token caching')
    }
    
    // Start server
    app.listen(SERVER_CONFIG.PORT, () => {
      console.log(`[server] listening on http://localhost:${SERVER_CONFIG.PORT}`)
      console.log('[server] Token caching: Redis (if available) or In-Memory fallback')
    })
  } catch (error) {
    console.error('[server] Failed to initialize server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[server] Received SIGINT, shutting down gracefully...')
  await disconnectRedis()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('[server] Received SIGTERM, shutting down gracefully...')
  await disconnectRedis()
  process.exit(0)
})

// Initialize server
initializeServer()
