// External
import { useMutation } from '@tanstack/vue-query'

// Internal
import { authApiRoutes } from '@features/auth/constants/apiRoutes'

import { apiClient } from '@shared/services/apiClient/apiClient'

export function useDeleteAccount() {
  return useMutation({
    mutationFn: () => apiClient.delete(authApiRoutes.self()),
  })
}
