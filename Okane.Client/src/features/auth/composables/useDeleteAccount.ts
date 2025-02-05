// External
import { useMutation } from '@tanstack/vue-query'

// Internal
import { apiClient } from '@shared/services/apiClient/apiClient'
import { authApiRoutes } from '@features/auth/constants/apiRoutes'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

export function useDeleteAccount() {
  const authStore = useAuthStore()

  return useMutation({
    mutationFn: () => apiClient.delete(authApiRoutes.self()),
    onSuccess() {
      authStore.resetState()
    },
  })
}
