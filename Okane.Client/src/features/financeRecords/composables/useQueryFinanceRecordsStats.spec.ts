// External
import { defineComponent } from 'vue'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'

import { useQueryFinanceRecordsStats } from '@features/financeRecords/composables/useQueryFinanceRecordsStats'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { wrapInAPIResponse } from '@tests/utils/apiResponse'
import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

function getTestComponent() {
  return defineComponent({
    setup() {
      useQueryFinanceRecordsStats()
    },
    template: '<div />',
  })
}

function mountWithProviders(args: { searchProvider?: SearchFinanceRecordsProvider } = {}) {
  let searchProvider = args.searchProvider
  if (!searchProvider) searchProvider = useSearchFinanceRecordsProvider()

  return getMountComponent(getTestComponent(), {
    global: {
      provide: {
        [SEARCH_FINANCE_RECORDS_SYMBOL]: searchProvider,
      },
    },
    withQueryClient: true,
  })()
}

test('makes a request to fetch stats for finance records', () => {
  const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInAPIResponse({}))
  const searchProvider = useSearchFinanceRecordsProvider()

  mountWithProviders({ searchProvider })

  expect(getSpy).toHaveBeenCalledWith(
    financeRecordAPIRoutes.getStats({ searchFilters: searchProvider.filters }),
    { signal: new AbortController().signal },
  )
})
