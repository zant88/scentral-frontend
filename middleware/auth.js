// middleware/auth.global.js
import { isLoggedIn } from '~/utils/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  // Skip auth check for login page
  if (to.path === '/login') return
  
  if (process.client && !isLoggedIn()) {
    return navigateTo('/login')
  }
})