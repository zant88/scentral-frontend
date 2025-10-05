// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    pageTransition: false,
    head: {
      title: 'Scentral',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        // Bootstrap 4 CSS (CDN)
        { rel: 'stylesheet', href: 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css' },
        { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.7.2/css/all.css' },
        { rel: 'stylesheet', href: '/css/components.css' },
        { rel: 'stylesheet', href: '/css/main.css' },
      ],
      script: [
        // jQuery (required by Bootstrap 4)
        { src: 'https://code.jquery.com/jquery-3.6.0.min.js', defer: true },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js', defer: true },
        { src: 'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js', defer: true },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery.nicescroll/3.7.6/jquery.nicescroll.min.js', defer: true },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js', defer: true },
        { src: 'https://unpkg.com/feather-icons', defer: true },
        { src: '/js/stisla.js', defer: true },
        { src: '/js/scripts.js', defer: true },
        { src: '/js/custom.js', defer: true },
        // Chart.js CDN for dashboard chart
        { src: 'https://cdn.jsdelivr.net/npm/chart.js', defer: true }
      ]
    }
  },
  plugins: [
    '~/plugins/bootstrap.client.js',
  ],
  // css: [
  //   '~/assets/styles/scss/style.scss'
  // ],
  build: {
    transpile: ['bootstrap']
  },
  compatibilityDate: '2024-11-01',
  devServer: {
    port: 4000,
    // host: '0.0.0.0'
  },
  runtimeConfig: {
    public: {
      apiBase: 'http://localhost:3030',
      mqttBase: 'wss://mqtt.kodemake.com',
    }
  },
  devtools: { 
    enabled: true
  },
  
  // Disable SSR to prevent WebSocket connection issues in development
  ssr: false,

  modules: [
    // '@nuxt/content', // Removed to prevent WebSocket connection errors in development
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxt/ui'
  ]
})