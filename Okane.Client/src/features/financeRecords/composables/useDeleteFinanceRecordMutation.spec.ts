// External
import { defineComponent, toRef } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { FINANCE_RECORD_API_ROUTES } from '@features/financeRecords/constants/apiRoutes'

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

const financeRecordId = toRef(1)
const queryKey = toRef(['a'])

const TestComponent = defineComponent({
  props: {
    shouldPassSearchFilters: Boolean,
  },
  setup() {
    const mutation = useDeleteFinanceRecordMutation(financeRecordId, queryKey)
    mutation.mutate()
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
    FINANCE_RECORD_API_ROUTES.DELETE_FINANCE_RECORD.buildPath({ id: financeRecordId.value }),
  )
})

test('removes the finance record from the query cache', async () => {
  const initialCachedData = {
    pages: [
      wrapInAPIPaginatedResponse(
        wrapInAPIResponse([
          createTestFinanceRecord({ id: financeRecordId.value }),
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
    removeItemFromPages(initialCachedData, (item) => item.id !== financeRecordId.value),
  )
})
