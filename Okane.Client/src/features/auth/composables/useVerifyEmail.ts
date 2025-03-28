// External
import { useMutation } from '@tanstack/vue-query'

// Internal
import { apiClient } from '@shared/services/apiClient/apiClient'
import { authApiRoutes } from '@features/auth/constants/apiRoutes'

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (body: { email: string; token: string }) =>
      apiClient.post(authApiRoutes.verifyEmail(), body),
  })
}
