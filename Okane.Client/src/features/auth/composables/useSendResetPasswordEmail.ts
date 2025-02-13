// External
import { useMutation } from '@tanstack/vue-query'

// Internal
import { authApiRoutes } from '@features/auth/constants/apiRoutes'
import { HONEYPOT_INPUT_NAME } from '@shared/constants/form'
import { HTTP_HEADER } from '@shared/constants/http'

import { apiClient } from '@shared/services/apiClient/apiClient'

export function useSendResetPasswordEmail() {
  return useMutation({
    mutationFn: (body: { email: string; [HONEYPOT_INPUT_NAME]: string }) =>
      apiClient.post(authApiRoutes.sendResetPasswordEmail(), body, {
        headers: {
          [HTTP_HEADER.X_USER_EMAIL]: body.email,
        },
      }),
  })
}
