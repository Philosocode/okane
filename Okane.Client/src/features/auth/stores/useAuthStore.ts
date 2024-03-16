// External
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// Internal
import type { LoginResponse } from '@/features/auth/types/authTypes'
import type { Timeout } from '@/shared/types/timeout'
import type { User } from '@/features/users/types/userTypes'

import { APIClient } from '@/shared/services/APIClient'
import { RouteName, router } from '@/features/navigation/services/router'

import { getJWTTokenPayload } from '@/features/auth/utils/authUtils'

export const useAuthStore = defineStore('AuthStore', () => {
  const authUser = ref<User>()
  const jwtToken = ref<string>()
  const isLoggedIn = computed(() => Boolean(authUser.value && jwtToken.value))
  const refreshTokenInterval = ref<Timeout>()

  async function register(email: string, name: string, password: string) {
    return APIClient.post('/auth/register', { email, name, password })
  }

  async function login(email: string, password: string) {
    const response = await APIClient.post<LoginResponse>(`/auth/login`, { email, password })
    initStateFromToken(response.jwtToken)
  }

  async function handleRefreshToken() {
    const newJWTToken = await APIClient.post<string>('/auth/refresh-token')
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
    await APIClient.post('/auth/logout', null)
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
