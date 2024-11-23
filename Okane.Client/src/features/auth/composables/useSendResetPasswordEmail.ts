// External
import { useMutation } from '@tanstack/vue-query'

// Internal
import { apiClient } from '@shared/services/apiClient/apiClient'
import { authAPIRoutes } from '@features/auth/constants/apiRoutes'

export function useSendResetPasswordEmail() {
  return useMutation({
    mutationFn: (body: { email: string }) =>
      apiClient.post(authAPIRoutes.sendResetPasswordEmail(), body),
  })
}
