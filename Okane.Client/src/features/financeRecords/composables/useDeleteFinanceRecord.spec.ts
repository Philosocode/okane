// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { useDeleteFinanceRecord } from '@features/financeRecords/composables/useDeleteFinanceRecord'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

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

const TestComponent = defineComponent({
  props: {
    shouldPassSearchFilters: Boolean,
  },
  setup() {
    const mutation = useDeleteFinanceRecord()
    mutation.mutate(financeRecordId)
  },
  template: '<div />',
})

function mountWithProviders(args: { searchProvider?: SearchFinanceRecordsProvider } = {}) {
  let searchProvider = args.searchProvider
  if (!searchProvider) searchProvider = useSearchFinanceRecordsProvider()

  return getMountComponent(TestComponent, {
    global: {
      provide: {
        [SEARCH_FINANCE_RECORDS_SYMBOL]: searchProvider,
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

  const searchProvider = useSearchFinanceRecordsProvider()
  const queryKey = financeRecordQueryKeys.listByFilters({ filters: searchProvider.filters })

  testQueryClient.setQueryData(queryKey, initialCachedData)
  spyOn.delete()
  mountWithProviders({ searchProvider })
  await flushPromises()

  const cachedData = testQueryClient.getQueryData(queryKey)
  expect(cachedData).toEqual(
    removeItemFromPages(initialCachedData, (item) => item.id !== financeRecordId),
  )
})

test('invalidates the stats key', async () => {
  const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries')
  const searchProvider = useSearchFinanceRecordsProvider()

  spyOn.delete()
  mountWithProviders({ searchProvider })
  await flushPromises()

  expect(invalidateSpy).toHaveBeenCalledWith({
    queryKey: financeRecordQueryKeys.stats({ filters: searchProvider.filters }),
  })
})
