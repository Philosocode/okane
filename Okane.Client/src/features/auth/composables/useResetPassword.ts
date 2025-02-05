// External
import { useMutation } from '@tanstack/vue-query'

// Internal
import { apiClient } from '@shared/services/apiClient/apiClient'
import { authApiRoutes } from '@features/auth/constants/apiRoutes'

export function useResetPassword() {
  return useMutation({
    mutationFn: (body: { email: string; password: string; token: string }) =>
      apiClient.post(authApiRoutes.resetPassword(), body),
  })
}
