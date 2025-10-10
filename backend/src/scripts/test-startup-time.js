import 'dotenv/config'
import { performance } from 'perf_hooks'

console.log('🚀 Testing server startup time...\n')

const startTime = performance.now()

try {
  // Import server components
  console.log('📦 Loading modules...')
  const moduleStart = performance.now()
  
  const app = await import('../app.js')
  const { sequelize } = await import('../db.js')
  const { connectRedis } = await import('../redis.js')
  
  const moduleEnd = performance.now()
  console.log(`✅ Modules loaded in ${(moduleEnd - moduleStart).toFixed(2)}ms`)
  
  // Test database connection
  console.log('🗄️  Testing database connection...')
  const dbStart = performance.now()
  
  try {
    await sequelize.authenticate()
    const dbEnd = performance.now()
    console.log(`✅ Database connected in ${(dbEnd - dbStart).toFixed(2)}ms`)
  } catch (dbError) {
    console.log(`❌ Database connection failed: ${dbError.message}`)
  }
  
  // Test Redis connection
  console.log('🔴 Testing Redis connection...')
  const redisStart = performance.now()
  
  try {
    await connectRedis()
    const redisEnd = performance.now()
    console.log(`✅ Redis connected in ${(redisEnd - redisStart).toFixed(2)}ms`)
  } catch (redisError) {
    const redisEnd = performance.now()
    console.log(`⚠️  Redis connection failed in ${(redisEnd - redisStart).toFixed(2)}ms: ${redisError.message}`)
    console.log('   (This is expected if Redis is not running)')
  }
  
  const endTime = performance.now()
  const totalTime = endTime - startTime
  
  console.log(`\n🎯 TOTAL STARTUP TIME: ${totalTime.toFixed(2)}ms`)
  
  if (totalTime < 1000) {
    console.log('✅ EXCELLENT: Startup time under 1 second!')
  } else if (totalTime < 3000) {
    console.log('✅ GOOD: Startup time under 3 seconds')
  } else if (totalTime < 5000) {
    console.log('⚠️  ACCEPTABLE: Startup time under 5 seconds')
  } else {
    console.log('❌ SLOW: Startup time over 5 seconds - needs optimization')
  }
  
} catch (error) {
  const endTime = performance.now()
  const totalTime = endTime - startTime
  
  console.log(`\n❌ ERROR after ${totalTime.toFixed(2)}ms:`, error.message)
  console.log('Stack trace:', error.stack)
}

process.exit(0)
