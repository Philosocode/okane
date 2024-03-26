// Internal
import { useAuthStore, type AuthStore } from '@/features/auth/useAuthStore'

import { createMockUser } from '@tests/factories/user.factory'
import { createMockJWTToken } from '@tests/factories/jwtToken.factory'

export function useAuthenticatedAuthStore(): AuthStore {
  const authStore = useAuthStore()

  authStore.authUser = createMockUser()
  authStore.jwtToken = createMockJWTToken()

  return authStore
}
