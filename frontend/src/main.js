import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import StockPage from './pages/stock.vue'

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/stock'
    },
    {
      path: '/stock',
      name: 'Stock',
      component: StockPage
    }
  ]
})

// Create and mount app
const app = createApp(App)
app.use(router)
app.mount('#app')