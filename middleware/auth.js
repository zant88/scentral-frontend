// middleware/auth.global.js
import { isLoggedIn } from '~/utils/auth'

export default defineNuxtRouteMiddleware((to, from) => {
  if (process.client && !isLoggedIn()) {
    return navigateTo('/login')
  }
})