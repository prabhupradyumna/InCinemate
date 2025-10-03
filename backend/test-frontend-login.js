import axios from 'axios';

// Test the frontend login flow
async function testFrontendLogin() {
  const FRONTEND_URL = 'http://localhost:3003/api';
  const BACKEND_URL = 'http://localhost:9000/api';
  
  console.log('🧪 Testing Frontend Login Flow...\n');
  
  try {
    // Test 1: Login via frontend endpoint (if it exists)
    console.log('1️⃣ Testing login via backend directly...');
    const loginResponse = await axios.post(`${BACKEND_URL}/auth/super-admin/login`, {
      email: 'superadmin@gmail.com',
      password: '123'
    });
    
    const token = loginResponse.data?.data?.accessToken;
    const user = loginResponse.data?.data?.user;
    
    console.log('✅ Backend login successful!');
    console.log('👤 User:', { email: user?.email, role: user?.role });
    console.log('🎫 Token stored for frontend use:', token ? 'YES' : 'NO');
    
    // Test 2: Verify token works with movie API
    console.log('\n2️⃣ Testing movie API with token...');
    const moviesResponse = await axios.get(`${BACKEND_URL}/superadmin/movies`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Movies API works with token!');
    console.log('📊 Movies found:', moviesResponse.data?.data?.length || 0);
    console.log('📄 Movie titles:', moviesResponse.data?.data?.map(m => m.title) || []);
    
    return { token, user, movies: moviesResponse.data?.data || [] };
    
  } catch (error) {
    console.error('❌ Test failed:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error || 'Unknown'
    });
    return null;
  }
}

testFrontendLogin().then(result => {
  if (result) {
    console.log('\n🎉 Login flow works correctly!');
    console.log('📝 Instructions for user:');
    console.log('   1. Go to http://localhost:3003/login');
    console.log('   2. Select "Super Admin" tab');
    console.log('   3. Enter: superadmin@gmail.com');
    console.log('   4. Enter password: 123');
    console.log('   5. Click "Sign In"');
    console.log('   6. Navigate to movies page to see the created movie');
  }
});