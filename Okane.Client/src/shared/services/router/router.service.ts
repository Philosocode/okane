// External
import { createRouter, createWebHistory } from 'vue-router'

// Internal
import { ROUTE_MAP, ROUTE_NAME } from '@/shared/services/router/router.constants'

import { useAuthStore } from '@/features/auth/useAuthStore'

export function createAppRouter() {
  return createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: Object.values(ROUTE_MAP),
  })
}

export const router = createAppRouter()

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (!to.meta.isPublic && !authStore.isLoggedIn) {
    return {
      name: ROUTE_NAME.LOGIN,
      query: { redirect_url: to.path },
    }
  }

  if (to.meta.isPublic && to.meta.isPublicOnly && authStore.isLoggedIn) {
    return { name: ROUTE_NAME.DASHBOARD }
  }
})
