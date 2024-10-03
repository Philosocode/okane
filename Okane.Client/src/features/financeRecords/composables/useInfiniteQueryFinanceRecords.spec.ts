// External
import { defineComponent, toValue } from 'vue'

// Internal
import { DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFinanceRecords'
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { INITIAL_PAGE } from '@shared/constants/request'

import { type FinanceRecordsSearchFilters } from '@features/financeRecords/types/searchFinanceRecords'

import * as useCleanUpInfiniteQuery from '@shared/composables/useCleanUpInfiniteQuery'
import { useInfiniteQueryFinanceRecords } from '@features/financeRecords/composables/useInfiniteQueryFinanceRecords'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { wrapInAPIResponse } from '@tests/utils/apiResponse'

function getTestComponent(filters: FinanceRecordsSearchFilters) {
  return defineComponent({
    setup() {
      useInfiniteQueryFinanceRecords(() => filters)
    },
    template: '<div />',
  })
}

const searchFilters = DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS
const mountComponent = getMountComponent(getTestComponent(searchFilters), { withQueryClient: true })

test('makes a request to fetch paginated finance records', () => {
  const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInAPIResponse({}))

  mountComponent()

  expect(getSpy).toHaveBeenCalledWith(
    financeRecordAPIRoutes.getPaginatedList({ page: INITIAL_PAGE, searchFilters }),
    {
      signal: new AbortController().signal,
    },
  )
})

test('cleans up the infinite query', () => {
  const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInAPIResponse({}))
  const cleanUpSpy = vi.spyOn(useCleanUpInfiniteQuery, 'useCleanUpInfiniteQuery').mockReturnValue()

  mountComponent()

  expect(toValue(cleanUpSpy.mock.calls[0][0])).toEqual(
    financeRecordQueryKeys.listByFilters(searchFilters),
  )

  getSpy.mockRestore()
})
