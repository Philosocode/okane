// External
import { useQuery, type QueryFunctionContext } from '@tanstack/vue-query'

// Internal
import { apiClient } from '@shared/services/apiClient/apiClient'

import { financeUserTagQueryKeys } from '@features/financeUserTags/constants/queryKeys'
import { financeUserTagApiRoutes } from '@features/financeUserTags/constants/apiRoutes'

import { type ApiResponse } from '@shared/services/apiClient/types'
import {
  type FinanceUserTag,
  type FinanceUserTagMap,
} from '@features/financeUserTags/types/financeUserTag'

function getFinanceUserTags({
  signal,
}: QueryFunctionContext): Promise<ApiResponse<FinanceUserTag>> {
  return apiClient.get(financeUserTagApiRoutes.getAll(), { signal })
}

export function useQueryFinanceUserTags() {
  return useQuery({
    queryKey: financeUserTagQueryKeys.listAll(),
    queryFn: getFinanceUserTags,
    select: (response) => {
      const userTagMap: FinanceUserTagMap = { Expense: [], Revenue: [] }

      response.items.forEach((userTag) => {
        userTagMap[userTag.type].push(userTag)
      })

      return userTagMap
    },
    staleTime: Infinity,
  })
}
