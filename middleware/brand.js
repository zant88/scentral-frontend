// middleware/brand.js
import { isLoggedIn, isBrand, isAdmin } from '~/utils/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (process.server) return
  
  // Check if user is logged in
  if (!isLoggedIn()) {
    return navigateTo('/login')
  }
  
  // If user is brand, allow access to brand pages
  if (isBrand()) {
    return // Brand user can proceed to brand pages
  }
  
  // Allow admin users to access brand pages for administration
  if (isAdmin()) {
    return // Admin can proceed to brand pages
  }
  
  // Redirect unauthorized users to login
  return navigateTo('/login')
})