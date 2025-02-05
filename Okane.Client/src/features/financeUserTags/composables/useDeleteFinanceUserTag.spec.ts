// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { financeUserTagApiRoutes } from '@features/financeUserTags/constants/apiRoutes'
import { financeUserTagQueryKeys } from '@features/financeUserTags/constants/queryKeys'

import { type ApiResponse } from '@shared/services/apiClient/types'
import { type FinanceUserTag } from '@features/financeUserTags/types/financeUserTag'

import { useDeleteFinanceUserTag } from '@features/financeUserTags/composables/useDeleteFinanceUserTag'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'
import { createTestTag } from '@tests/factories/tag'
import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { wrapInApiResponse } from '@tests/utils/apiResponse'

const spyOn = {
  delete() {
    return vi.spyOn(apiClient, 'delete').mockResolvedValue()
  },
}

const userTagId = 540

const TestComponent = defineComponent({
  props: {
    shouldPassSearchFilters: Boolean,
  },
  setup() {
    const mutation = useDeleteFinanceUserTag()
    mutation.mutate({ id: userTagId })
  },
  template: '<div />',
})

const mountComponent = getMountComponent(TestComponent, {
  withQueryClient: true,
})

test('makes a DELETE request to the expected endpoint', async () => {
  const spy = spyOn.delete()

  mountComponent()

  await flushPromises()

  expect(spy).toHaveBeenCalledWith(financeUserTagApiRoutes.delete({ id: userTagId }))
})

test('updates the expected cached finance user tags', async () => {
  spyOn.delete()

  const existingUserTags = [
    createTestFinanceUserTag({
      id: 1,
      tag: createTestTag({ id: 1, name: 'a' }),
    }),
    createTestFinanceUserTag({
      id: userTagId,
      tag: createTestTag({ id: 2, name: 'b' }),
    }),
  ]

  const queryKey = financeUserTagQueryKeys.listAll()

  testQueryClient.setQueryData(queryKey, wrapInApiResponse(existingUserTags))
  mountComponent()
  await flushPromises()

  const cachedUserTags = testQueryClient.getQueryData<ApiResponse<FinanceUserTag>>(queryKey)
  expect(cachedUserTags?.items).toEqual([existingUserTags[0]])
})
