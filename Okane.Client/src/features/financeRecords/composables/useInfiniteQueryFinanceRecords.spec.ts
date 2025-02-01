// External
import { flushPromises } from '@vue/test-utils'
import { defineComponent, toValue } from 'vue'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { SORT_DIRECTION } from '@shared/constants/search'

import * as useCleanUpInfiniteQuery from '@shared/composables/useCleanUpInfiniteQuery'
import { useInfiniteQueryFinanceRecords } from '@features/financeRecords/composables/useInfiniteQueryFinanceRecords'

import { apiClient } from '@shared/services/apiClient/apiClient'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { getFinanceRecordsSearchCursor } from '@features/financeRecords/utils/searchFinanceRecords'
import { wrapInAPIPaginatedResponse, wrapInAPIResponse } from '@tests/utils/apiResponse'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'

function getTestComponent() {
  return defineComponent({
    setup() {
      const { fetchNextPage } = useInfiniteQueryFinanceRecords()
      return { fetchNextPage }
    },
    template: '<button @click="fetchNextPage" />',
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

test('makes multiple requests to fetch paginated finance records', async () => {
  const financeRecord = createTestFinanceRecord()
  const getSpy = vi
    .spyOn(apiClient, 'get')
    .mockResolvedValueOnce(wrapInAPIPaginatedResponse(wrapInAPIResponse([financeRecord]), {}))
    .mockResolvedValueOnce(
      wrapInAPIPaginatedResponse(wrapInAPIResponse([]), { hasNextPage: false }),
    )

  const searchProvider = useSearchFinanceRecordsProvider()
  searchProvider.setFilters({ sortDirection: SORT_DIRECTION.ASCENDING, sortField: 'amount' })

  const wrapper = mountWithProviders({ searchProvider })
  await flushPromises()

  expect(getSpy).toHaveBeenCalledOnce()
  expect(getSpy).toHaveBeenLastCalledWith(
    financeRecordAPIRoutes.getPaginatedList({
      cursor: {},
      searchFilters: searchProvider.filters,
    }),
    {
      signal: new AbortController().signal,
    },
  )

  const button = wrapper.get('button')
  await button.trigger('click')
  await flushPromises()

  expect(getSpy).toHaveBeenCalledTimes(2)
  expect(getSpy).toHaveBeenLastCalledWith(
    financeRecordAPIRoutes.getPaginatedList({
      cursor: getFinanceRecordsSearchCursor(searchProvider.filters, financeRecord),
      searchFilters: searchProvider.filters,
    }),
    {
      signal: new AbortController().signal,
    },
  )
})

test('cleans up the infinite query', () => {
  const cleanUpSpy = vi.spyOn(useCleanUpInfiniteQuery, 'useCleanUpInfiniteQuery').mockReturnValue()
  const searchProvider = useSearchFinanceRecordsProvider()

  mountWithProviders()

  expect(toValue(cleanUpSpy.mock.calls[0][0])).toEqual(
    financeRecordQueryKeys.listByFilters({ filters: searchProvider.filters }),
  )
})
