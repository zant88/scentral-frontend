// plugins/auth.client.js
export default defineNuxtPlugin((nuxtApp) => {
  // Check authentication on client side
  const accessToken = localStorage.getItem('access_token');
  const currentPath = window.location.pathname;
  
  // If not logged in and not on login page or video player page, redirect to login
  if (!accessToken && currentPath !== '/login' && currentPath !== '/video-player') {
    window.location.href = '/login';
    return;
  }
});
