// middleware/auth.global.js
import { isLoggedIn } from '~/utils/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Skip auth check for login page and video player page
  if (to.path === '/login' || to.path === '/video-player') return
  
  // On server-side, we need to check cookies or let client-side handle it
  if (process.server) {
    // For SSR, we'll let the client-side middleware handle the redirect
    // since we can't access localStorage on server
    return
  }
  
  // On client-side, check if user is logged in
  if (process.client && !isLoggedIn()) {
    return navigateTo('/login')
  }
})
