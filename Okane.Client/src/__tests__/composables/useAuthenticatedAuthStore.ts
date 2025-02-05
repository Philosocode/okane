// Internal
import { useAuthStore, type AuthStore } from '@features/auth/composables/useAuthStore'

import { createTestUser } from '@tests/factories/user'
import { createTestJwtToken } from '@tests/factories/jwtToken'

export function useAuthenticatedAuthStore(): AuthStore {
  const authStore = useAuthStore()

  authStore.authUser = createTestUser()
  authStore.jwtToken = createTestJwtToken()

  return authStore
}
