// External
import { defineComponent } from 'vue'

// Internal
import { FINANCE_RECORD_QUERY_KEYS } from '@features/financeRecords/constants/financeRecord.constants'
import { DEFAULT_PAGE_SIZE, INITIAL_PAGE } from '@shared/constants/request.constants'

import * as useCleanUpInfiniteQuery from '@shared/composables/useCleanUpInfiniteQuery'
import { useInfiniteQueryFinanceRecords } from '@features/financeRecords/composables/useInfiniteQueryFinanceRecords'

import { apiClient } from '@shared/services/apiClient/apiClient.service'

import { wrapInAPIResponse } from '@tests/factories/apiResponse.factory'

const TestComponent = defineComponent({
  setup() {
    useInfiniteQueryFinanceRecords()
  },
  template: '<div />',
})

const mountComponent = getMountComponent(TestComponent, { withQueryClient: true })

test('makes a request to fetch paginated finance records', () => {
  const cleanUpSpy = vi.spyOn(useCleanUpInfiniteQuery, 'useCleanUpInfiniteQuery').mockReturnValue()
  const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInAPIResponse({}))

  mountComponent()

  expect(cleanUpSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      _value: FINANCE_RECORD_QUERY_KEYS.LIST_BY_FILTERS(),
    }),
  )

  expect(getSpy).toHaveBeenCalledWith(
    `/finance-records?page=${INITIAL_PAGE}&pageSize=${DEFAULT_PAGE_SIZE}`,
    { signal: new AbortController().signal },
  )
})
