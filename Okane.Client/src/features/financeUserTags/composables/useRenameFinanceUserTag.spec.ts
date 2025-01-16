// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { financeUserTagAPIRoutes } from '@features/financeUserTags/constants/apiRoutes'
import { financeUserTagQueryKeys } from '@features/financeUserTags/constants/queryKeys'

import { type APIResponse } from '@shared/services/apiClient/types'
import {
  type FinanceUserTag,
  type RenameFinanceUserTagRequest,
} from '@features/financeUserTags/types/financeUserTag'

import { useRenameFinanceUserTag } from '@features/financeUserTags/composables/useRenameFinanceUserTag'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'
import { createTestTag } from '@tests/factories/tag'
import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'

const existingUserTags = [
  createTestFinanceUserTag({
    id: 1,
    tag: createTestTag({ id: 1, name: '1' }),
  }),
  createTestFinanceUserTag({
    id: 2,
    tag: createTestTag({ id: 2, name: '2' }),
  }),
]

const renameRequest: RenameFinanceUserTagRequest = {
  id: existingUserTags[1].id,
  name: '2-updated',
}

const responseUserTag = createTestFinanceUserTag({
  id: 3,
  tag: createTestTag({ id: 3, name: renameRequest.name }),
})

const spyOn = {
  put() {
    return vi.spyOn(apiClient, 'put').mockResolvedValue(wrapInAPIResponse(responseUserTag))
  },
}

const TestComponent = defineComponent({
  setup() {
    const mutation = useRenameFinanceUserTag()
    mutation.mutate(renameRequest)
  },
  template: '<div />',
})

const mountComponent = getMountComponent(TestComponent, { withQueryClient: true })

test('makes a PUT request to the expected endpoint', async () => {
  const putSpy = spyOn.put()

  mountComponent()

  await flushPromises()

  expect(putSpy).toHaveBeenCalledWith(financeUserTagAPIRoutes.rename({ id: renameRequest.id }), {
    name: renameRequest.name,
  })
})

test('updates the cached finance user tags', async () => {
  spyOn.put()

  const queryKey = financeUserTagQueryKeys.listAll()

  testQueryClient.setQueryData(queryKey, wrapInAPIResponse(existingUserTags))
  mountComponent()
  await flushPromises()

  const cachedUserTags = testQueryClient.getQueryData<APIResponse<FinanceUserTag>>(queryKey)
  expect(cachedUserTags?.items).toEqual([existingUserTags[0], responseUserTag])
})
