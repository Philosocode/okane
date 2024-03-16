// External
import { createApp } from 'vue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createPinia } from 'pinia'

// Internal
import App from '@/App.vue'

import { router } from '@/features/navigation/services/router'

import { useAuthStore } from '@/features/auth/stores/useAuthStore'

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
    console.info('Failed to authenticate user on start up.')
  }

  app.use(router)
  app.use(VueQueryPlugin)

  app.mount('#app')
}
