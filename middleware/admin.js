// middleware/admin.js
import { isLoggedIn, isAdmin } from '~/utils/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (process.server) return
  
  // Check if user is logged in
  if (!isLoggedIn()) {
    return navigateTo('/login')
  }
  
  // Check if user is admin
  if (!isAdmin()) {
    // Redirect non-admin users to their appropriate dashboard
    return navigateTo('/brand/dashboard')
  }
})