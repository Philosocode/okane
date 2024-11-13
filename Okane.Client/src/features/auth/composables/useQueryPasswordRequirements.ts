// External
import { useQuery, type QueryFunctionContext } from '@tanstack/vue-query'

// Internal
import { authQueryKeys } from '@features/auth/constants/queryKeys'
import { apiClient } from '@shared/services/apiClient/apiClient'
import { authAPIRoutes } from '@features/auth/constants/apiRoutes'

import { type APIResponse } from '@shared/services/apiClient/types'
import { type PasswordRequirements } from '@features/auth/types/authForm'

function getPasswordRequirements({
  signal,
}: QueryFunctionContext): Promise<APIResponse<PasswordRequirements>> {
  return apiClient.get(authAPIRoutes.passwordRequirements(), { signal })
}

export function useQueryPasswordRequirements({ enabled = true } = {}) {
  return useQuery({
    enabled,
    queryKey: authQueryKeys.passwordRequirements(),
    queryFn: getPasswordRequirements,
    select: (data) => data.items[0],
    staleTime: Infinity,
  })
}
