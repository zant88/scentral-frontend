// Test login functionality
const testLogin = async () => {
  const apiUrl = 'http://localhost:3030';
  
  console.log('Testing login with correct credentials...');
  
  try {
    const response = await fetch(`${apiUrl}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_email: 'admin@scentral.id',
        password: 'password'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.meta.success) {
      console.log('✅ Login successful!');
      console.log('User role:', data.data.user.role);
      console.log('Access token received:', !!data.data.access_token);
      
      // Test redirection logic
      const userRole = data.data.user.role;
      let redirectUrl;
      
      if (userRole === 'admin') {
        redirectUrl = '/admin/dashboard';
      } else if (userRole === 'brand') {
        redirectUrl = '/brand/dashboard';
      } else {
        redirectUrl = '/';
      }
      
      console.log('Should redirect to:', redirectUrl);
      
      // Simulate localStorage storage
      console.log('Tokens would be stored in localStorage');
      
    } else {
      console.log('❌ Login failed:', data.meta.message);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Test brand login too
const testBrandLogin = async () => {
  const apiUrl = 'http://localhost:3030';
  
  console.log('\nTesting brand login...');
  
  try {
    const response = await fetch(`${apiUrl}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_email: 'brand@scentral.com',
        password: 'password'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.meta.success) {
      console.log('✅ Brand login successful!');
      console.log('User role:', data.data.user.role);
      console.log('Should redirect to: /brand/dashboard');
    } else {
      console.log('❌ Brand login failed:', data.meta.message);
    }
    
  } catch (error) {
    console.error('❌ Brand login network error:', error);
  }
};

// Run tests
testLogin();
testBrandLogin();