// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { useDeleteFinanceRecord } from '@features/financeRecords/composables/useDeleteFinanceRecord'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { removeItemFromPages } from '@shared/utils/pagination'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { wrapInApiPaginatedResponse, wrapInApiResponse } from '@tests/utils/apiResponse'
import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'

const spyOn = {
  delete() {
    return vi.spyOn(apiClient, 'delete').mockResolvedValue()
  },
}

const financeRecord = createTestFinanceRecord()

function createTestComponent(financeRecordToDelete = financeRecord) {
  return defineComponent({
    props: {
      shouldPassSearchFilters: Boolean,
    },
    setup() {
      const mutation = useDeleteFinanceRecord()
      mutation.mutate(financeRecordToDelete)
    },
    template: '<div />',
  })
}

const TestComponent = createTestComponent()

const mountComponent = getMountComponent(TestComponent, {
  withQueryClient: true,
})

test('makes a DELETE request to the expected endpoint', async () => {
  const deleteSpy = spyOn.delete()

  mountComponent()
  await flushPromises()

  expect(deleteSpy).toHaveBeenCalledWith(
    financeRecordApiRoutes.deleteFinanceRecord({ id: financeRecord.id }),
  )
})

test('removes the finance record from the query cache', async () => {
  const initialCachedData = {
    pages: [
      wrapInApiPaginatedResponse(
        wrapInApiResponse([
          createTestFinanceRecord({ id: financeRecord.id }),
          createTestFinanceRecord({ id: 2 }),
          createTestFinanceRecord({ id: 3 }),
        ]),
      ),
    ],
    pageParams: [],
  }

  const searchStore = useFinanceRecordSearchStore()
  const queryKey = financeRecordQueryKeys.listByFilters({ filters: searchStore.filters })
  testQueryClient.setQueryData(queryKey, initialCachedData)

  spyOn.delete()
  mountComponent()
  await flushPromises()

  const cachedData = testQueryClient.getQueryData(queryKey)
  expect(cachedData).toEqual(
    removeItemFromPages(initialCachedData, (item) => item.id !== financeRecord.id),
  )
})

test('invalidates the stats query', async () => {
  spyOn.delete()
  const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries')
  const searchStore = useFinanceRecordSearchStore()

  mountComponent()

  expect(invalidateSpy).not.toHaveBeenCalled()

  await flushPromises()

  expect(invalidateSpy).toHaveBeenCalledExactlyOnceWith({
    queryKey: financeRecordQueryKeys.stats({ filters: searchStore.filters }),
  })
})
