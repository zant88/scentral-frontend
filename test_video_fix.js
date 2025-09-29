// Test script to verify video API fix
const apiUrl = 'http://localhost:3030';

// Test login and video API
async function testVideoFix() {
  console.log('Testing video API fix...');
  
  try {
    // Step 1: Login
    console.log('\n1. Testing login...');
    const loginResponse = await fetch(`${apiUrl}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_email: 'admin@scentral.id',
        password: 'password'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok || !loginData.meta.success) {
      console.error('Login failed:', loginData.meta.message);
      return;
    }
    
    console.log('✅ Login successful');
    const accessToken = loginData.data.access_token;
    
    // Step 2: Test video API
    console.log('\n2. Testing video API...');
    const videoResponse = await fetch(`${apiUrl}/api/video`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const videoData = await videoResponse.json();
    
    if (!videoResponse.ok) {
      console.error('Video API failed:', videoData);
      return;
    }
    
    console.log('✅ Video API response format:');
    console.log('- Has success field:', 'success' in videoData);
    console.log('- Success value:', videoData.success);
    console.log('- Has data field:', 'data' in videoData);
    console.log('- Number of videos:', videoData.data ? videoData.data.length : 0);
    
    if (videoData.success && videoData.data) {
      console.log('\n✅ API fix is working correctly!');
      console.log('Videos found:', videoData.data.length);
      videoData.data.forEach((video, index) => {
        console.log(`  ${index + 1}. ${video.title} (ID: ${video.id})`);
      });
    } else {
      console.log('\n❌ API response format is incorrect');
      console.log('Expected: {success: true, data: [...]}');
      console.log('Received:', JSON.stringify(videoData, null, 2));
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Run the test
testVideoFix();