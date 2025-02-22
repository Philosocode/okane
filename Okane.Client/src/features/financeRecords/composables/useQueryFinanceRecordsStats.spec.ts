// External
import { defineComponent } from 'vue'

// Internal
import { DEFAULT_FINANCES_TIME_INTERVAL } from '@features/financeRecords/constants/stats'
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { TIME_INTERVAL } from '@shared/constants/dateTime'

import { useQueryFinanceRecordsStats } from '@features/financeRecords/composables/useQueryFinanceRecordsStats'

import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  type FinanceRecordSearchFiltersProvider,
  useFinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { wrapInApiResponse } from '@tests/utils/apiResponse'

function getTestComponent(timeInterval?: TIME_INTERVAL) {
  return defineComponent({
    setup() {
      useQueryFinanceRecordsStats(timeInterval)
    },
    template: '<div />',
  })
}

function mountWithProviders(
  args: { searchProvider?: FinanceRecordSearchFiltersProvider; timeInterval?: TIME_INTERVAL } = {},
) {
  let searchProvider = args.searchProvider
  if (!searchProvider) searchProvider = useFinanceRecordSearchFiltersProvider()

  return getMountComponent(getTestComponent(args.timeInterval), {
    global: {
      provide: {
        [FINANCE_RECORD_SEARCH_FILTERS_SYMBOL]: searchProvider,
      },
    },
    withQueryClient: true,
  })()
}

test('makes a request to fetch stats for finance records with the default time interval', () => {
  const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInApiResponse({}))
  const searchProvider = useFinanceRecordSearchFiltersProvider()

  mountWithProviders({ searchProvider })

  expect(getSpy).toHaveBeenCalledWith(
    financeRecordApiRoutes.getStats({
      searchFilters: searchProvider.filters,
      timeInterval: DEFAULT_FINANCES_TIME_INTERVAL,
    }),
    { signal: new AbortController().signal },
  )
})

test('makes a request with the passed time interval', () => {
  const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInApiResponse({}))
  const searchProvider = useFinanceRecordSearchFiltersProvider()
  const timeInterval = TIME_INTERVAL.YEAR
  mountWithProviders({ searchProvider, timeInterval })

  expect(getSpy).toHaveBeenCalledWith(
    financeRecordApiRoutes.getStats({ searchFilters: searchProvider.filters, timeInterval }),
    { signal: new AbortController().signal },
  )
})
