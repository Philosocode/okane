// External
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// Internal
import { authApiRoutes } from '@features/auth/constants/apiRoutes'
import { HTTP_HEADER } from '@shared/constants/http'

import { type AuthenticateResponse } from '@features/auth/types/authResponse'
import { type User } from '@features/users/types'
import { type Timeout } from '@shared/types/shared'
import { type LoginRequest, type RegisterRequest } from '@features/auth/types/authForm'

import { apiClient } from '@shared/services/apiClient/apiClient'
import { ROUTE_NAME, getRouter } from '@shared/services/router/router'

import { getQueryClient } from '@shared/services/queryClient/queryClient'
import { getJwtTokenPayload } from '@features/auth/utils/authResponse'

export type AuthStore = ReturnType<typeof useAuthStore>

export const useAuthStore = defineStore('AuthStore', () => {
  const authUser = ref<User>()
  const jwtToken = ref<string>()
  const isLoggedIn = computed<boolean>(() => Boolean(authUser.value && jwtToken.value))
  const refreshTokenInterval = ref<Timeout>()

  /**
   * Register a user.
   * @param request
   */
  async function register(request: RegisterRequest): Promise<void> {
    await apiClient.post(authApiRoutes.register(), request, {
      headers: {
        [HTTP_HEADER.X_USER_EMAIL]: request.email,
      },
    })
  }

  /**
   * Log in a user and update the auth store.
   *
   * @param request
   */
  async function login(request: LoginRequest) {
    const response = await apiClient.post<AuthenticateResponse>(`/auth/login`, request)
    initState(response)
  }

  /**
   * Get a new JWT token and update the auth store.
   */
  async function handleRefreshToken() {
    const response = await apiClient.post<AuthenticateResponse>(authApiRoutes.refreshToken())
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
   * Reset the auth store state.
   */
  function resetState() {
    clearTimeout(refreshTokenInterval.value)

    authUser.value = undefined
    jwtToken.value = undefined

    const queryClient = getQueryClient()
    queryClient.clear()
  }

  /**
   * Start a timer to refresh the JWT token before it expires.
   */
  function startRefreshTokenTimer() {
    if (!isLoggedIn.value || !jwtToken.value) return

    const payload = getJwtTokenPayload(jwtToken.value)

    // Set a timeout to refresh the token 1 minute before it expires.
    const expiresAt = new Date(payload.exp * 1000)
    const timeout = expiresAt.getTime() - Date.now() - 60000

    refreshTokenInterval.value = setTimeout(handleRefreshToken, timeout)
  }

  /**
   * Log out the user and reset the store state.
   */
  async function logout() {
    await apiClient.post(authApiRoutes.logout())
    resetState()
    await getRouter().push({ name: ROUTE_NAME.LOGIN })
  }

  return {
    authUser,
    isLoggedIn,
    jwtToken,

    handleRefreshToken,
    login,
    logout,
    register,
    resetState,
  }
})
