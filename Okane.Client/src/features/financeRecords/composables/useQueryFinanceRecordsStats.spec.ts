// External
import { defineComponent } from 'vue'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'

import { useQueryFinanceRecordsStats } from '@features/financeRecords/composables/useQueryFinanceRecordsStats'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { wrapInApiResponse } from '@tests/utils/apiResponse'
import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  type FinanceRecordSearchFiltersProvider,
  useFinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

function getTestComponent() {
  return defineComponent({
    setup() {
      useQueryFinanceRecordsStats()
    },
    template: '<div />',
  })
}

function mountWithProviders(args: { searchProvider?: FinanceRecordSearchFiltersProvider } = {}) {
  let searchProvider = args.searchProvider
  if (!searchProvider) searchProvider = useFinanceRecordSearchFiltersProvider()

  return getMountComponent(getTestComponent(), {
    global: {
      provide: {
        [FINANCE_RECORD_SEARCH_FILTERS_SYMBOL]: searchProvider,
      },
    },
    withQueryClient: true,
  })()
}

test('makes a request to fetch stats for finance records', () => {
  const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInApiResponse({}))
  const searchProvider = useFinanceRecordSearchFiltersProvider()

  mountWithProviders({ searchProvider })

  expect(getSpy).toHaveBeenCalledWith(
    financeRecordApiRoutes.getStats({ searchFilters: searchProvider.filters }),
    { signal: new AbortController().signal },
  )
})
