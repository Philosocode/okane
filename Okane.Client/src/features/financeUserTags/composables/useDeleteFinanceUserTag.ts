// External
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Internal
import { type ApiResponse } from '@shared/services/apiClient/types'
import { type FinanceUserTag } from '@features/financeUserTags/types/financeUserTag'

import { apiClient } from '@shared/services/apiClient/apiClient'
import { financeUserTagApiRoutes } from '@features/financeUserTags/constants/apiRoutes'
import { financeUserTagQueryKeys } from '@features/financeUserTags/constants/queryKeys'

function deleteFinanceUserTag(args: { id: number }): Promise<void> {
  return apiClient.delete(financeUserTagApiRoutes.delete({ id: args.id }))
}

export function useDeleteFinanceUserTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteFinanceUserTag,
    onSuccess(res, args) {
      queryClient.setQueryData<ApiResponse<FinanceUserTag>>(
        financeUserTagQueryKeys.listAll(),
        (userTagResponse) => {
          if (!userTagResponse) return userTagResponse

          return {
            ...userTagResponse,
            items: userTagResponse.items.filter((userTag) => userTag.id !== args.id),
          }
        },
      )
    },
  })
}
