// External
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Internal
import { financeUserTagApiRoutes } from '@features/financeUserTags/constants/apiRoutes'
import { financeUserTagQueryKeys } from '@features/financeUserTags/constants/queryKeys'

import { type ApiResponse } from '@shared/services/apiClient/types'
import {
  type FinanceUserTag,
  type RenameFinanceUserTagRequest,
} from '@features/financeUserTags/types/financeUserTag'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { compareStrings } from '@shared/utils/string'
import { insertIntoSortedArray } from '@shared/utils/array'

function putRenameFinanceUserTag(
  args: RenameFinanceUserTagRequest,
): Promise<ApiResponse<FinanceUserTag>> {
  return apiClient.put(financeUserTagApiRoutes.rename({ id: args.id }), {
    name: args.name,
  })
}

export function useRenameFinanceUserTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: putRenameFinanceUserTag,
    onSuccess(res, args) {
      queryClient.setQueryData<ApiResponse<FinanceUserTag>>(
        financeUserTagQueryKeys.listAll(),
        (userTagResponse) => {
          if (!userTagResponse) return userTagResponse

          // Insert the new tag.
          let updatedItems = insertIntoSortedArray({
            arr: userTagResponse.items,
            element: res.items[0],
            // Tag names are saved as lowercase, so we don't need to do any lowercase conversion before comparison.
            compareFn: (t1, t2) => compareStrings(t1.tag.name, t2.tag.name),
          })

          // Remove the old tag.
          updatedItems = updatedItems.filter((userTag) => userTag.id !== args.id)

          return {
            ...userTagResponse,
            items: updatedItems,
          }
        },
      )
    },
  })
}
