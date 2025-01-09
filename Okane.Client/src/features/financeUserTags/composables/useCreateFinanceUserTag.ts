// External
import { useMutation, useQueryClient } from '@tanstack/vue-query'

// Internal
import { type APIResponse } from '@shared/services/apiClient/types'
import {
  type CreateFinanceUserTagRequest,
  type FinanceUserTag,
} from '@features/financeUserTags/types/financeUserTag'

import { apiClient } from '@shared/services/apiClient/apiClient'
import { financeUserTagAPIRoutes } from '@features/financeUserTags/constants/apiRoutes'
import { financeUserTagQueryKeys } from '@features/financeUserTags/constants/queryKeys'

import { compareStrings } from '@shared/utils/string'
import { insertIntoSortedArray } from '@shared/utils/array'

function postFinanceUserTag(
  body: CreateFinanceUserTagRequest,
): Promise<APIResponse<FinanceUserTag>> {
  return apiClient.post(financeUserTagAPIRoutes.post(), body)
}

export function useCreateFinanceUserTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postFinanceUserTag,
    onSuccess(res) {
      queryClient.setQueryData<APIResponse<FinanceUserTag>>(
        financeUserTagQueryKeys.listAll(),
        (tagResponse) => {
          if (!tagResponse) return tagResponse

          const updatedItems = insertIntoSortedArray({
            arr: tagResponse.items,
            element: res.items[0],
            // Tag names are saved as lowercase, so we don't need to do any lowercase conversion before comparison.
            compareFn: (t1, t2) => compareStrings(t1.tag.name, t2.tag.name),
          })

          return {
            ...tagResponse,
            items: updatedItems,
          }
        },
      )
    },
  })
}
