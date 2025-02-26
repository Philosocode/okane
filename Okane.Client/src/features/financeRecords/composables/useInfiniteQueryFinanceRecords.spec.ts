// External
import { flushPromises } from '@vue/test-utils'
import { defineComponent, toValue } from 'vue'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { SORT_DIRECTION } from '@shared/constants/search'

import * as useCleanUpInfiniteQuery from '@shared/composables/useCleanUpInfiniteQuery'
import { useInfiniteQueryFinanceRecords } from '@features/financeRecords/composables/useInfiniteQueryFinanceRecords'
import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { getFinanceRecordsSearchCursor } from '@features/financeRecords/utils/searchFilters'
import { wrapInApiPaginatedResponse, wrapInApiResponse } from '@tests/utils/apiResponse'

function getTestComponent() {
  return defineComponent({
    setup() {
      const { fetchNextPage } = useInfiniteQueryFinanceRecords()
      return { fetchNextPage }
    },
    template: '<button @click="fetchNextPage" />',
  })
}

const mountComponent = getMountComponent(getTestComponent(), {
  withQueryClient: true,
})

test('makes multiple requests to fetch paginated finance records', async () => {
  const financeRecords = [
    createTestFinanceRecord(),
    createTestFinanceRecord({ id: 2, amount: 720 }),
  ]
  const getSpy = vi
    .spyOn(apiClient, 'get')
    .mockResolvedValueOnce(wrapInApiPaginatedResponse(wrapInApiResponse(financeRecords)))
    .mockResolvedValueOnce(
      wrapInApiPaginatedResponse(wrapInApiResponse([]), { hasNextPage: false }),
    )

  const searchStore = useFinanceRecordSearchStore()
  searchStore.setFilters({ sortDirection: SORT_DIRECTION.ASCENDING, sortField: 'amount' })

  const wrapper = mountComponent()
  await flushPromises()

  expect(getSpy).toHaveBeenCalledOnce()
  expect(getSpy).toHaveBeenLastCalledWith(
    financeRecordApiRoutes.getPaginatedList({
      cursor: {},
      searchFilters: searchStore.filters,
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
    financeRecordApiRoutes.getPaginatedList({
      cursor: getFinanceRecordsSearchCursor(searchStore.filters, financeRecords[1]),
      searchFilters: searchStore.filters,
    }),
    {
      signal: new AbortController().signal,
    },
  )
})

test('cleans up the infinite query', () => {
  vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInApiResponse([]))

  const cleanUpSpy = vi.spyOn(useCleanUpInfiniteQuery, 'useCleanUpInfiniteQuery').mockReturnValue()
  const searchStore = useFinanceRecordSearchStore()

  mountComponent()

  expect(toValue(cleanUpSpy.mock.calls[0][0])).toEqual(
    financeRecordQueryKeys.listByFilters({ filters: searchStore.filters }),
  )
})
