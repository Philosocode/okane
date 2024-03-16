// External
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Internal
import DashboardPage from '@/shared/pages/DashboardPage.vue'
import LoginPage from '@/shared/pages/LoginPage.vue'
import RegisterPage from '@/shared/pages/RegisterPage.vue'

import { useAuthStore } from '@/features/auth/stores/useAuthStore'

export enum RouteName {
  DashboardPage = 'DashboardPage',
  LoginPage = 'LoginPage',
  RegisterPage = 'RegisterPage',
}

export const ROUTES: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: RouteName.DashboardPage,
    component: DashboardPage,
  },
  {
    path: '/login',
    name: RouteName.LoginPage,
    component: LoginPage,
    meta: { isPublic: true },
  },
  {
    path: '/register',
    name: RouteName.RegisterPage,
    component: RegisterPage,
    meta: { isPublic: true },
  },
] as const

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: ROUTES,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (!to.meta.isPublic && !authStore.isLoggedIn) {
    return {
      name: RouteName.LoginPage,
      query: { redirect_url: to.path },
    }
  }

  if (to.meta.isPublic && to.meta.isPublicOnly && authStore.isLoggedIn) {
    return { name: RouteName.DashboardPage }
  }
})
