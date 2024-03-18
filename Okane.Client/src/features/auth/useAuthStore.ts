// External
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// Internal
import type { LoginResponse } from '@/features/auth/auth.types'
import type { User } from '@/features/users/user.types'

import { apiClient } from '@/features/requests/apiClient.service'
import { router } from '@/features/navigation/router.service'
import { RouteName } from '../navigation/router.constants'

import { getJWTTokenPayload } from '@/features/auth/auth.utils'

export const useAuthStore = defineStore('AuthStore', () => {
  const authUser = ref<User>()
  const jwtToken = ref<string>()
  const isLoggedIn = computed(() => Boolean(authUser.value && jwtToken.value))
  const refreshTokenInterval = ref<NodeJS.Timeout>()

  /**
   * Register a user.
   *
   * @param email
   * @param name
   * @param password
   */
  async function register(email: string, name: string, password: string): Promise<void> {
    return apiClient.post('/auth/register', { email, name, password })
  }

  /**
   * Log in a user and update the auth store.
   *
   * @param email
   * @param password
   */
  async function login(email: string, password: string) {
    const response = await apiClient.post<LoginResponse>(`/auth/login`, { email, password })
    initStateFromToken(response.jwtToken)
  }

  /**
   * Get a new JWT token and update the auth store.
   */
  async function handleRefreshToken() {
    const newJWTToken = await apiClient.post<string>('/auth/refresh-token')
    initStateFromToken(newJWTToken)
  }

  /**
   * Initialize auth store state from a JWT token.
   *
   * @param token
   */
  function initStateFromToken(token: string) {
    const payload = getJWTTokenPayload(token)

    authUser.value = {
      email: payload.email,
      name: payload.name,
    }

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
    const timeout = expiresAt.getTime() - Date.now() - 60 * 1000

    refreshTokenInterval.value = setTimeout(handleRefreshToken, timeout)
  }

  /**
   * Log out the user by clearing the store state.
   */
  async function logout() {
    await apiClient.post('/auth/logout', null)
    clearTimeout(refreshTokenInterval.value)

    authUser.value = undefined
    jwtToken.value = undefined

    await router.push({ name: RouteName.LoginPage })
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
