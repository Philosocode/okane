// External
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { VueQueryPlugin } from '@tanstack/vue-query'

// Internal
import App from './App.vue'

import { getRouter } from '@shared/services/router/router'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { getQueryClient } from '@shared/services/queryClient/queryClient'

import '@vueform/multiselect/themes/default.css'
import '@shared/styles/index.scss'
import '@shared/services/fontAwesome/fontAwesome'

startApp()

async function startApp() {
  const app = createApp(App)

  app.component('font-awesome-icon', FontAwesomeIcon)

  app.use(createPinia())

  // This should happen before the router is added so that router.beforeEach
  // redirects the user as expected on startup.
  try {
    const authStore = useAuthStore()
    await authStore.handleRefreshToken()
  } catch {
    console.info('Failed to authenticate user on startup.')
  }

  app.use(getRouter())

  app.use(VueQueryPlugin, { queryClient: getQueryClient() })

  app.mount('#app')
}
