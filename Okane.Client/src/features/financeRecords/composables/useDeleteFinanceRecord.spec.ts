// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { useDeleteFinanceRecord } from '@features/financeRecords/composables/useDeleteFinanceRecord'

import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  type FinanceRecordSearchFiltersProvider,
  useFinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { removeItemFromPages } from '@shared/utils/pagination'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { wrapInApiPaginatedResponse, wrapInApiResponse } from '@tests/utils/apiResponse'

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

function mountWithProviders(args: { searchProvider?: FinanceRecordSearchFiltersProvider } = {}) {
  let searchProvider = args.searchProvider
  if (!searchProvider) searchProvider = useFinanceRecordSearchFiltersProvider()

  return getMountComponent(TestComponent, {
    global: {
      provide: {
        [FINANCE_RECORD_SEARCH_FILTERS_SYMBOL]: searchProvider,
      },
    },
    withQueryClient: true,
  })()
}

test('makes a DELETE request to the expected endpoint', async () => {
  const deleteSpy = spyOn.delete()

  mountWithProviders()
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

  const searchProvider = useFinanceRecordSearchFiltersProvider()
  const queryKey = financeRecordQueryKeys.listByFilters({ filters: searchProvider.filters })
  testQueryClient.setQueryData(queryKey, initialCachedData)

  spyOn.delete()
  mountWithProviders({ searchProvider })
  await flushPromises()

  const cachedData = testQueryClient.getQueryData(queryKey)
  expect(cachedData).toEqual(
    removeItemFromPages(initialCachedData, (item) => item.id !== financeRecord.id),
  )
})

test('invalidates the stats query', async () => {
  spyOn.delete()
  const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries')

  const searchProvider = useFinanceRecordSearchFiltersProvider()
  mountWithProviders({ searchProvider })

  expect(invalidateSpy).not.toHaveBeenCalled()

  await flushPromises()

  expect(invalidateSpy).toHaveBeenCalledExactlyOnceWith({
    queryKey: financeRecordQueryKeys.stats({ filters: searchProvider.filters }),
  })
})
