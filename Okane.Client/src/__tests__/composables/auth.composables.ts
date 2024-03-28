// Internal
import { useAuthStore, type AuthStore } from '@features/auth/useAuthStore'

import { createStubUser } from '@tests/factories/user.factory'
import { createStubJWTToken } from '@tests/factories/jwtToken.factory'

export function useAuthenticatedAuthStore(): AuthStore {
  const authStore = useAuthStore()

  authStore.authUser = createStubUser()
  authStore.jwtToken = createStubJWTToken()

  return authStore
}
