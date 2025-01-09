// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { financeUserTagAPIRoutes } from '@features/financeUserTags/constants/apiRoutes'
import { financeUserTagQueryKeys } from '@features/financeUserTags/constants/queryKeys'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { type APIResponse } from '@shared/services/apiClient/types'
import {
  type CreateFinanceUserTagRequest,
  type FinanceUserTag,
} from '@features/financeUserTags/types/financeUserTag'

import { useCreateFinanceUserTag } from '@features/financeUserTags/composables/useCreateFinanceUserTag'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'
import { createTestTag } from '@tests/factories/tag'
import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'

const body: CreateFinanceUserTagRequest = {
  name: 'a',
  type: FINANCE_RECORD_TYPE.REVENUE,
}

const createdUserTag = createTestFinanceUserTag({
  id: 2,
  tag: { id: 2, name: body.name },
  type: body.type,
})

const spyOn = {
  post() {
    return vi.spyOn(apiClient, 'post').mockResolvedValue(wrapInAPIResponse(createdUserTag))
  },
}

const TestComponent = defineComponent({
  setup() {
    const mutation = useCreateFinanceUserTag()
    mutation.mutate(body)
  },
  template: '<div />',
})

const mountComponent = getMountComponent(TestComponent, { withQueryClient: true })

test('makes a POST request to the expected endpoint', async () => {
  const postSpy = spyOn.post()

  mountComponent()

  await flushPromises()

  expect(postSpy).toHaveBeenCalledWith(financeUserTagAPIRoutes.post(), body)
})

test('updates the expected cached finance user tags', async () => {
  spyOn.post()

  const queryKey = financeUserTagQueryKeys.listAll()
  const existingUserTag = createTestFinanceUserTag({
    tag: createTestTag({ name: 'b' }),
  })

  testQueryClient.setQueryData(queryKey, wrapInAPIResponse(existingUserTag))
  mountComponent()
  await flushPromises()

  const cachedUserTags = testQueryClient.getQueryData<APIResponse<FinanceUserTag>>(queryKey)
  expect(cachedUserTags?.items).toEqual([createdUserTag, existingUserTag])
})
