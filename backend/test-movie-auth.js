import axios from 'axios';

// Test authentication and movie listing with fresh token
async function testMovieAuthentication() {
  const BASE_URL = 'http://localhost:9000/api';
  
  console.log('🧪 Testing Movie API Authentication (Fresh Test)...\n');
  
  try {
    // Get fresh token
    console.log('🔄 Getting fresh authentication token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/super-admin/login`, {
      email: 'superadmin@gmail.com',
      password: '123'
    });
    
    const token = loginResponse.data?.data?.accessToken;
    const user = loginResponse.data?.data?.user;
    
    console.log('✅ Fresh login successful!');
    console.log('👤 User info:', { 
      email: user?.email, 
      role: user?.role,
      id: user?.id 
    });
    console.log('🎫 Fresh Token (first 30 chars):', token?.substring(0, 30) + '...');
    console.log('🎫 Full Token for testing:', token);
    
    // Test movies access
    console.log('\n🎬 Testing movies access with fresh token...');
    const moviesResponse = await axios.get(`${BASE_URL}/superadmin/movies`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Movies fetched successfully!');
    console.log('📊 Movies found:', moviesResponse.data?.data?.length || 0);
    console.log('📄 First movie:', moviesResponse.data?.data?.[0]?.title || 'No movies');
    
    // Test tenants access (since frontend also fetches tenants)
    console.log('\n🏢 Testing tenants access...');
    const tenantsResponse = await axios.get(`${BASE_URL}/superadmin/tenants`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Tenants fetched successfully!');
    console.log('📊 Tenants found:', tenantsResponse.data?.data?.length || 0);
    
  } catch (error) {
    console.error('❌ Test failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error || 'Unknown',
      code: error.code || 'NO_CODE',
      url: error.config?.url || 'NO_URL'
    });
    if (error.code === 'ECONNREFUSED') {
      console.error('🔥 Backend server is not running on port 9000!');
    }
  }
}

testMovieAuthentication();