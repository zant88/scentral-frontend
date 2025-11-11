// middleware/auth.js
import { isLoggedIn } from '~/utils/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Only run on client side
  if (process.server) return
  
  // Check if user is logged in
  if (!isLoggedIn()) {
    return navigateTo('/login')
  }
})