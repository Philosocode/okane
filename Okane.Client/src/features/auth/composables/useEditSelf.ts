// External
import { useMutation } from '@tanstack/vue-query'

// Internal
import { apiClient } from '@shared/services/apiClient/apiClient'
import { authApiRoutes } from '@features/auth/constants/apiRoutes'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

export type PatchSelfBody = {
  name: string
  currentPassword: string
  newPassword: string
}

export const defaultBody = {
  name: '',
  currentPassword: '',
  newPassword: '',
}

function patchSelf(body: Partial<PatchSelfBody>) {
  return apiClient.patch(authApiRoutes.self(), {
    ...defaultBody,
    ...body,
  })
}

export function useEditSelf() {
  const authStore = useAuthStore()

  return useMutation({
    mutationFn: patchSelf,
    onSuccess(_, body) {
      if (authStore.authUser && body.name) {
        authStore.authUser.name = body.name
      }
    },
  })
}
