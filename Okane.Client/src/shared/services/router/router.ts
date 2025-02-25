// External
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Internal
import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { getQueryClient } from '@shared/services/queryClient/queryClient'

export enum ROUTE_NAME {
  ACCOUNT = 'account',
  ACCOUNT_DELETED = 'accountDeleted',
  FINANCES = 'finances',
  LOGIN = 'login',
  MANAGE_FINANCE_TAGS = 'manageFinanceTags',
  REGISTER = 'register',
  RESET_PASSWORD = 'resetPassword',
  SEND_RESET_PASSWORD_EMAIL = 'sendResetPasswordEmail',
  VERIFY_EMAIL = 'verifyEmail',
}

export type Route = RouteRecordRaw & {
  buildPath: (params?: Record<string, unknown>) => string
}
export const appRoutes: Record<ROUTE_NAME, Route> = {
  [ROUTE_NAME.ACCOUNT]: {
    path: '/account',
    buildPath: () => '/account',
    name: ROUTE_NAME.ACCOUNT,
    component: () => import('@shared/pages/AccountPage.vue'),
  },
  [ROUTE_NAME.ACCOUNT_DELETED]: {
    path: '/account-deleted',
    buildPath: () => '/account-deleted',
    name: ROUTE_NAME.ACCOUNT_DELETED,
    component: () => import('@shared/pages/AccountDeletedPage.vue'),
    meta: { isPublic: true, isPublicOnly: true },
  },
  [ROUTE_NAME.FINANCES]: {
    path: '/',
    buildPath: () => '/',
    name: ROUTE_NAME.FINANCES,
    component: () => import('@shared/pages/FinancesPage.vue'),
  },
  [ROUTE_NAME.LOGIN]: {
    path: '/login',
    buildPath: () => '/login',
    name: ROUTE_NAME.LOGIN,
    component: () => import('@shared/pages/LoginPage.vue'),
    meta: { isPublic: true, isPublicOnly: true },
  },
  [ROUTE_NAME.MANAGE_FINANCE_TAGS]: {
    path: '/manage-finance-tags',
    buildPath: () => '/manage-finance-tags',
    name: ROUTE_NAME.MANAGE_FINANCE_TAGS,
    component: () => import('@shared/pages/ManageFinanceUserTagsPage.vue'),
  },
  [ROUTE_NAME.REGISTER]: {
    path: '/register',
    buildPath: () => '/register',
    name: ROUTE_NAME.REGISTER,
    component: () => import('@shared/pages/RegisterPage.vue'),
    meta: { isPublic: true, isPublicOnly: true },
  },
  [ROUTE_NAME.RESET_PASSWORD]: {
    path: '/reset-password',
    buildPath: () => '/reset-password',
    name: ROUTE_NAME.RESET_PASSWORD,
    component: () => import('@shared/pages/ResetPasswordPage.vue'),
    meta: { isPublic: true, isPublicOnly: true },
  },
  [ROUTE_NAME.SEND_RESET_PASSWORD_EMAIL]: {
    path: '/send-reset-password-email',
    buildPath: () => '/send-reset-password-email',
    name: ROUTE_NAME.SEND_RESET_PASSWORD_EMAIL,
    component: () => import('@shared/pages/SendResetPasswordEmailPage.vue'),
    meta: { isPublic: true, isPublicOnly: true },
  },
  [ROUTE_NAME.VERIFY_EMAIL]: {
    path: '/verify-email',
    buildPath: () => '/verify-email',
    name: ROUTE_NAME.VERIFY_EMAIL,
    component: () => import('@shared/pages/VerifyEmailPage.vue'),
    meta: { isPublic: true, isPublicOnly: true },
  },
}

export function createAppRouter() {
  return createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: Object.values(appRoutes),
  })
}

const router = createAppRouter()

export const getRouter = () => router

router.beforeEach((to) => {
  const authStore = useAuthStore()
  const queryClient = getQueryClient()

  if (!to.meta.isPublic && !authStore.isLoggedIn) {
    queryClient.clear()

    return {
      name: ROUTE_NAME.LOGIN,
      query: { redirect_url: to.path },
    }
  }

  if (to.meta.isPublic && to.meta.isPublicOnly && authStore.isLoggedIn) {
    return { name: ROUTE_NAME.FINANCES }
  }
})
