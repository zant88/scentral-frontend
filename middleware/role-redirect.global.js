// middleware/role-redirect.global.js
import { isLoggedIn, getUserRole } from '~/utils/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (process.server) return
  
  // Skip middleware for login page to prevent interference
  if (to.path === '/login') return
  
  // Skip if not logged in (auth middleware will handle this)
  if (!isLoggedIn()) return
  
  const userRole = getUserRole()
  const currentPath = to.path
  
  // Define role-based access rules
  const adminPaths = ['/admin']
  const brandPaths = ['/brand']
  
  // Check if current path starts with admin routes
  const isAdminRoute = adminPaths.some(path => currentPath.startsWith(path))
  const isBrandRoute = brandPaths.some(path => currentPath.startsWith(path))
  
  // Redirect based on role and current path
  if (userRole === 'admin') {
    // Admin can access both admin and brand routes for administration
    // Only redirect to admin dashboard when accessing root
    if (currentPath === '/') {
      return navigateTo('/admin/dashboard')
    }
  } else if (userRole === 'brand') {
    // Brand trying to access admin routes
    if (isAdminRoute) {
      return navigateTo('/brand/dashboard')
    }
    // Brand accessing root - redirect to brand dashboard
    if (currentPath === '/') {
      return navigateTo('/brand/dashboard')
    }
  } else {
    // Unknown role - logout and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      return navigateTo('/login')
    }
  }
})