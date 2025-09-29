// utils/auth.js
export function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  const accessToken = localStorage.getItem('access_token');
  return !!accessToken;
}

export function getUserRole() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    const userData = JSON.parse(user);
    return userData.role || null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

export function getUserData() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

export function isAdmin() {
  return getUserRole() === 'admin';
}

export function isBrand() {
  return getUserRole() === 'brand';
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export async function fetchWithAuth(url, options = {}) {
  let accessToken = localStorage.getItem('access_token');
  let refreshToken = localStorage.getItem('refresh_token');

  // Attach access token
  options.headers = options.headers || {};
  if (accessToken) {
    options.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, options);
  // If unauthorized, try to refresh token
  if (response.status === 401) {
    // Try to refresh the access token
    if(refreshToken){ 
      // Import useRuntimeConfig inside the function to avoid SSR issues
      const { useRuntimeConfig } = await import('#app');
      const config = useRuntimeConfig();
      const apiUrl = config.public.apiBase || '';
      const refreshRes = await fetch(`${apiUrl}/api/user/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const refreshData = await refreshRes.json();
      if (refreshRes.ok && refreshData.data && refreshData.data.access_token) {
        // Save new access token
        localStorage.setItem('access_token', refreshData.data.access_token);
        // Retry original request with new token
        options.headers['Authorization'] = `Bearer ${refreshData.data.access_token}`;
        response = await fetch(url, options);
      } else {
        // Refresh failed, clear tokens and redirect to login
        // console.log('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
    }else {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      throw new Error('Session expired. Please log in again.');
    }
    
  }

  return response;
}