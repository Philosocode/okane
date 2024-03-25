// External
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Internal
import DashboardPage from '@/shared/pages/DashboardPage.vue'
import LoginPage from '@/shared/pages/LoginPage.vue'
import RegisterPage from '@/shared/pages/RegisterPage.vue'

import { useAuthStore } from '@/features/auth/useAuthStore'

export enum ROUTE_NAME {
  DASHBOARD = 'DASHBOARD',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
}

export const ROUTES: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: ROUTE_NAME.DASHBOARD,
    component: DashboardPage,
  },
  {
    path: '/login',
    name: ROUTE_NAME.LOGIN,
    component: LoginPage,
    meta: { isPublic: true, isPublicOnly: true },
  },
  {
    path: '/register',
    name: ROUTE_NAME.REGISTER,
    component: RegisterPage,
    meta: { isPublic: true, isPublicOnly: true },
  },
] as const

export function createAppRouter() {
  return createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: ROUTES,
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
