// External
import { useMutation } from '@tanstack/vue-query'

// Internal
import { apiClient } from '@shared/services/apiClient/apiClient'
import { HTTP_HEADER } from '@shared/constants/http'

import { authApiRoutes } from '@features/auth/constants/apiRoutes'

export function useSendVerificationEmail() {
  return useMutation({
    mutationFn: (body: { email: string }) =>
      apiClient.post(authApiRoutes.sendVerificationEmail(), body, {
        headers: {
          [HTTP_HEADER.X_USER_EMAIL]: body.email,
        },
      }),
  })
}
