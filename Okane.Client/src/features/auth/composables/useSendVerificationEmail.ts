// External
import { useMutation } from '@tanstack/vue-query'

// Internal
import { apiClient } from '@shared/services/apiClient/apiClient'
import { authAPIRoutes } from '@features/auth/constants/apiRoutes'

export function useSendVerificationEmail() {
  return useMutation({
    mutationFn: (body: { email: string }) =>
      apiClient.post(authAPIRoutes.sendVerificationEmail(), body),
  })
}
