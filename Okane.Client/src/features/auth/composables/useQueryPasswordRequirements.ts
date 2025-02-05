// External
import { useQuery, type QueryFunctionContext } from '@tanstack/vue-query'

// Internal
import { authQueryKeys } from '@features/auth/constants/queryKeys'
import { apiClient } from '@shared/services/apiClient/apiClient'
import { authApiRoutes } from '@features/auth/constants/apiRoutes'

import { type ApiResponse } from '@shared/services/apiClient/types'
import { type PasswordRequirements } from '@features/auth/types/authForm'

function getPasswordRequirements({
  signal,
}: QueryFunctionContext): Promise<ApiResponse<PasswordRequirements>> {
  return apiClient.get(authApiRoutes.passwordRequirements(), { signal })
}

export function useQueryPasswordRequirements() {
  return useQuery({
    queryKey: authQueryKeys.passwordRequirements(),
    queryFn: getPasswordRequirements,
    select: (data) => data.items[0],
    staleTime: Infinity,
  })
}
