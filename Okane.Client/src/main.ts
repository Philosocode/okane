// External
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'

// Internal
import App from 'App.vue'

import { getRouter } from '@shared/services/router/router.service'

import { useAuthStore } from '@features/auth/useAuthStore'

import '@shared/styles/index.scss'

await startApp()

async function startApp() {
  const app = createApp(App)

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
  app.use(VueQueryPlugin)

  app.mount('#app')
}
