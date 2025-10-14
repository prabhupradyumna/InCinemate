import 'dotenv/config'
import { connectRedis, disconnectRedis } from '../redis.js'
import TokenCacheService from '../services/tokenCache.js'

async function testRedisCache() {
  try {
    console.log('🧪 Testing Redis Token Cache Implementation...\n')
    
    // Connect to Redis
    await connectRedis()
    console.log('✅ Connected to Redis\n')
    
    // Test data
    const testToken = 'test-access-token-123'
    const testUserInfo = {
      userId: 'test-user-123',
      email: 'test@example.com',
      role: 'admin',
      tenantId: 'test-tenant'
    }
    
    // Test 1: Store access token
    console.log('📝 Test 1: Storing access token...')
    const storeResult = await TokenCacheService.storeAccessToken(testToken, testUserInfo, 60) // 1 minute TTL
    console.log('Store result:', storeResult ? '✅ Success' : '❌ Failed')
    
    // Test 2: Retrieve access token
    console.log('\n📖 Test 2: Retrieving access token...')
    const retrievedInfo = await TokenCacheService.getAccessTokenInfo(testToken)
    console.log('Retrieved info:', retrievedInfo ? '✅ Success' : '❌ Failed')
    if (retrievedInfo) {
      console.log('User info:', JSON.stringify(retrievedInfo, null, 2))
    }
    
    // Test 3: Check blacklist (should be false)
    console.log('\n🚫 Test 3: Checking blacklist status...')
    const isBlacklisted = await TokenCacheService.isTokenBlacklisted(testToken)
    console.log('Is blacklisted:', isBlacklisted ? '❌ Yes (unexpected)' : '✅ No (expected)')
    
    // Test 4: Blacklist token
    console.log('\n🚫 Test 4: Blacklisting token...')
    const blacklistResult = await TokenCacheService.blacklistToken(testToken, 60)
    console.log('Blacklist result:', blacklistResult ? '✅ Success' : '❌ Failed')
    
    // Test 5: Check blacklist again (should be true)
    console.log('\n🚫 Test 5: Checking blacklist status after blacklisting...')
    const isBlacklistedAfter = await TokenCacheService.isTokenBlacklisted(testToken)
    console.log('Is blacklisted:', isBlacklistedAfter ? '✅ Yes (expected)' : '❌ No (unexpected)')
    
    // Test 6: Try to retrieve blacklisted token
    console.log('\n📖 Test 6: Trying to retrieve blacklisted token...')
    const retrievedAfterBlacklist = await TokenCacheService.getAccessTokenInfo(testToken)
    console.log('Retrieved info:', retrievedAfterBlacklist ? '❌ Success (unexpected)' : '✅ Failed (expected)')
    
    // Test 7: Get cache statistics
    console.log('\n📊 Test 7: Getting cache statistics...')
    const stats = await TokenCacheService.getCacheStats()
    console.log('Cache stats:', JSON.stringify(stats, null, 2))
    
    // Test 8: Clear cache
    console.log('\n🧹 Test 8: Clearing cache...')
    const clearResult = await TokenCacheService.clearAllTokenCache()
    console.log('Clear result:', clearResult ? '✅ Success' : '❌ Failed')
    
    // Test 9: Get stats after clearing
    console.log('\n📊 Test 9: Getting cache statistics after clearing...')
    const statsAfterClear = await TokenCacheService.getCacheStats()
    console.log('Cache stats after clear:', JSON.stringify(statsAfterClear, null, 2))
    
    console.log('\n🎉 Redis Token Cache Tests Completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await disconnectRedis()
    console.log('\n👋 Disconnected from Redis')
  }
}

// Run tests
testRedisCache()
