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

  async function register(email: string, name: string, password: string) {
    return apiClient.post('/auth/register', { email, name, password })
  }

  async function login(email: string, password: string) {
    const response = await apiClient.post<LoginResponse>(`/auth/login`, { email, password })
    initStateFromToken(response.jwtToken)
  }

  async function handleRefreshToken() {
    const newJWTToken = await apiClient.post<string>('/auth/refresh-token')
    initStateFromToken(newJWTToken)
  }

  function initStateFromToken(token: string) {
    const payload = getJWTTokenPayload(token)

    authUser.value = {
      email: payload.email,
      name: payload.name,
    }

    jwtToken.value = token

    startRefreshTokenTimer()
  }

  function startRefreshTokenTimer() {
    if (!isLoggedIn.value || !jwtToken.value) return

    const payload = getJWTTokenPayload(jwtToken.value)

    // Set a timeout to refresh the token 1 minute before it expires.
    const expiresAt = new Date(payload.exp * 1000)
    const timeout = expiresAt.getTime() - Date.now() - 60 * 1000

    refreshTokenInterval.value = setTimeout(handleRefreshToken, timeout)
  }

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
