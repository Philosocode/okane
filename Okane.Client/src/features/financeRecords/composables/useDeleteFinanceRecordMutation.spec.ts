// External
import { defineComponent, toRef } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'

import { useDeleteFinanceRecordMutation } from '@features/financeRecords/composables/useDeleteFinanceRecordMutation'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { removeItemFromPages } from '@shared/utils/pagination'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { wrapInAPIPaginatedResponse, wrapInAPIResponse } from '@tests/utils/apiResponse'

const spyOn = {
  delete() {
    return vi.spyOn(apiClient, 'delete').mockResolvedValue()
  },
}

const financeRecordId = 540
const queryKey = toRef(['a'])

const TestComponent = defineComponent({
  props: {
    shouldPassSearchFilters: Boolean,
  },
  setup() {
    const mutation = useDeleteFinanceRecordMutation(queryKey)
    mutation.mutate(financeRecordId)
  },
  template: '<div />',
})

function mountComponent() {
  return getMountComponent(TestComponent, { withQueryClient: true })()
}

test('makes a DELETE request to the expected endpoint', async () => {
  const deleteSpy = spyOn.delete()

  mountComponent()

  await flushPromises()

  expect(deleteSpy).toHaveBeenCalledWith(
    financeRecordAPIRoutes.deleteFinanceRecord({ id: financeRecordId }),
  )
})

test('removes the finance record from the query cache', async () => {
  const initialCachedData = {
    pages: [
      wrapInAPIPaginatedResponse(
        wrapInAPIResponse([
          createTestFinanceRecord({ id: financeRecordId }),
          createTestFinanceRecord({ id: 2 }),
          createTestFinanceRecord({ id: 3 }),
        ]),
      ),
    ],
    pageParams: [],
  }

  testQueryClient.setQueryData(queryKey.value, initialCachedData)

  spyOn.delete()

  mountComponent()

  await flushPromises()

  const cachedData = testQueryClient.getQueryData(queryKey.value)
  expect(cachedData).toEqual(
    removeItemFromPages(initialCachedData, (item) => item.id !== financeRecordId),
  )
})
