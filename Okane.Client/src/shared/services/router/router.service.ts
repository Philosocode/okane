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

export type Route = RouteRecordRaw & {
  buildPath: (params?: Record<string, unknown>) => string
}
export const ROUTE_MAP: Record<ROUTE_NAME, Route> = {
  [ROUTE_NAME.DASHBOARD]: {
    path: '/',
    buildPath: () => '/',
    name: ROUTE_NAME.DASHBOARD,
    component: DashboardPage,
  },
  [ROUTE_NAME.LOGIN]: {
    path: '/login',
    buildPath: () => '/login',
    name: ROUTE_NAME.LOGIN,
    component: LoginPage,
    meta: { isPublic: true, isPublicOnly: true },
  },
  [ROUTE_NAME.REGISTER]: {
    path: '/register',
    buildPath: () => '/register',
    name: ROUTE_NAME.REGISTER,
    component: RegisterPage,
    meta: { isPublic: true, isPublicOnly: true },
  },
}

export function createAppRouter() {
  return createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: Object.values(ROUTE_MAP),
  })
}

const router = createAppRouter()

export const getRouter = () => router

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
