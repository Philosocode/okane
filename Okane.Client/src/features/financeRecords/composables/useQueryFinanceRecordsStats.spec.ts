// External
import { defineComponent } from 'vue'

// Internal
import { DEFAULT_FINANCES_TIME_INTERVAL } from '@features/financeRecords/constants/stats'
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { TIME_INTERVAL } from '@shared/constants/dateTime'

import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'
import { useQueryFinanceRecordsStats } from '@features/financeRecords/composables/useQueryFinanceRecordsStats'

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

function mountComponent(timeInterval?: TIME_INTERVAL) {
  return getMountComponent(getTestComponent(timeInterval), {
    withQueryClient: true,
  })()
}

test('makes a request to fetch stats for finance records with the default time interval', () => {
  const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInApiResponse({}))
  const searchStore = useFinanceRecordSearchStore()
  mountComponent()

  expect(getSpy).toHaveBeenCalledWith(
    financeRecordApiRoutes.getStats({
      searchFilters: searchStore.filters,
      timeInterval: DEFAULT_FINANCES_TIME_INTERVAL,
    }),
    { signal: new AbortController().signal },
  )
})

test('makes a request with the passed time interval', () => {
  const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInApiResponse({}))
  const searchStore = useFinanceRecordSearchStore()
  const timeInterval = TIME_INTERVAL.YEAR
  mountComponent(timeInterval)

  expect(getSpy).toHaveBeenCalledWith(
    financeRecordApiRoutes.getStats({ searchFilters: searchStore.filters, timeInterval }),
    { signal: new AbortController().signal },
  )
})
