// External
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// Internal
import { authAPIRoutes } from '@features/auth/constants/apiRoutes'

import type { User } from '@features/users/types'
import type { Timeout } from '@shared/types/shared'

import { apiClient } from '@shared/services/apiClient/apiClient'
import { ROUTE_NAME, getRouter } from '@shared/services/router/router'

import { getQueryClient } from '@shared/services/queryClient/queryClient'
import type { AuthenticateResponse } from '@features/auth/types/authResponse'
import { getJWTTokenPayload } from '@features/auth/utils/authResponse'

export type AuthStore = ReturnType<typeof useAuthStore>

export const useAuthStore = defineStore('AuthStore', () => {
  const authUser = ref<User>()
  const jwtToken = ref<string>()
  const isLoggedIn = computed<boolean>(() => Boolean(authUser.value && jwtToken.value))
  const refreshTokenInterval = ref<Timeout>()

  /**
   * Register a user.
   *
   * @param email
   * @param name
   * @param password
   */
  async function register(email: string, name: string, password: string): Promise<void> {
    await apiClient.post(authAPIRoutes.register(), { email, name, password })
  }

  /**
   * Log in a user and update the auth store.
   *
   * @param email
   * @param password
   */
  async function login(email: string, password: string) {
    const response = await apiClient.post<AuthenticateResponse>(`/auth/login`, { email, password })
    initState(response)
  }

  /**
   * Get a new JWT token and update the auth store.
   */
  async function handleRefreshToken() {
    const response = await apiClient.post<AuthenticateResponse>(authAPIRoutes.refreshToken())
    initState(response)
  }

  /**
   * Initialize auth store state.
   *
   * @param response
   */
  function initState(response: AuthenticateResponse) {
    if (response.items.length == 0) return

    const { jwtToken: token, user } = response.items[0]
    authUser.value = user
    jwtToken.value = token

    startRefreshTokenTimer()
  }

  /**
   * Start a timer to refresh the JWT token before it expires.
   */
  function startRefreshTokenTimer() {
    if (!isLoggedIn.value || !jwtToken.value) return

    const payload = getJWTTokenPayload(jwtToken.value)

    // Set a timeout to refresh the token 1 minute before it expires.
    const expiresAt = new Date(payload.exp * 1000)
    const timeout = expiresAt.getTime() - Date.now() - 60000

    refreshTokenInterval.value = setTimeout(handleRefreshToken, timeout)
  }

  /**
   * Log out the user by clearing the store state.
   */
  async function logout() {
    await apiClient.post(authAPIRoutes.logout())
    clearTimeout(refreshTokenInterval.value)

    authUser.value = undefined
    jwtToken.value = undefined

    const queryClient = getQueryClient()
    queryClient.clear()

    await getRouter().push({ name: ROUTE_NAME.LOGIN })
  }

  return {
    authUser,
    isLoggedIn,
    jwtToken,

    register,
    login,
    handleRefreshToken,
    logout,
  }
})
