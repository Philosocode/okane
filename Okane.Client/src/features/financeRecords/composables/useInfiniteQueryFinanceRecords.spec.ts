// External
import { defineComponent, toRef, type Ref } from 'vue'

// Internal
import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'
import { FINANCE_RECORD_QUERY_KEYS } from '@features/financeRecords/constants/queryKeys'
import { INITIAL_PAGE } from '@shared/constants/request'
import { FINANCE_RECORD_API_ROUTES } from '@features/financeRecords/constants/apiRoutes'

import { type FinanceRecordSearchFilters } from '@features/financeRecords/types/searchFilters'

import * as useCleanUpInfiniteQuery from '@shared/composables/useCleanUpInfiniteQuery'
import { useInfiniteQueryFinanceRecords } from '@features/financeRecords/composables/useInfiniteQueryFinanceRecords'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { wrapInAPIResponse } from '@tests/utils/apiResponse'

function getTestComponent(filters?: Ref<FinanceRecordSearchFilters>) {
  return defineComponent({
    setup() {
      useInfiniteQueryFinanceRecords(filters)
    },
    template: '<div />',
  })
}

const searchFilters = toRef(DEFAULT_FINANCE_RECORD_SEARCH_FILTERS)

const mountComponent = getMountComponent(getTestComponent(searchFilters), { withQueryClient: true })

test('makes a request to fetch paginated finance records', () => {
  const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInAPIResponse({}))

  mountComponent()

  expect(getSpy).toHaveBeenCalledWith(
    FINANCE_RECORD_API_ROUTES.GET_PAGINATED_LIST.buildPath({ page: INITIAL_PAGE }),
    {
      signal: new AbortController().signal,
    },
  )
})

test('cleans up the infinite query', () => {
  const cleanUpSpy = vi.spyOn(useCleanUpInfiniteQuery, 'useCleanUpInfiniteQuery').mockReturnValue()

  mountComponent()

  expect(cleanUpSpy.mock.calls[0][0]?.value).toEqual(
    FINANCE_RECORD_QUERY_KEYS.LIST_BY_FILTERS(searchFilters),
  )
})

test('does nothing if searchFilters are undefined', () => {
  const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInAPIResponse({}))

  getMountComponent(getTestComponent(), { withQueryClient: true })()

  expect(getSpy).not.toHaveBeenCalled()
})
