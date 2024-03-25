// External
import type { RouteRecordRaw } from 'vue-router'

// Internal
import DashboardPage from '@/shared/pages/DashboardPage.vue'
import LoginPage from '@/shared/pages/LoginPage.vue'
import RegisterPage from '@/shared/pages/RegisterPage.vue'

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
