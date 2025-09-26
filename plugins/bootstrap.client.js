
// import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js'

// export default defineNuxtPlugin((nuxtApp) => {
//   nuxtApp.provide('bootstrap', bootstrap)
// })

import { Modal, Toast } from 'bootstrap'

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      bootstrap: {
        Modal,
        Toast
        // Add other components you need
      }
    }
  }
})