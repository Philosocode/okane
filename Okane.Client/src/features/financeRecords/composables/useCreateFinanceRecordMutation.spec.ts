// External
import { flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { useCreateFinanceRecordMutation } from '@features/financeRecords/composables/useCreateFinanceRecordMutation'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'

const financeRecord = createTestFinanceRecord()

const spyOn = {
  post() {
    return vi.spyOn(apiClient, 'post').mockResolvedValue(wrapInAPIResponse('ok'))
  },
  invalidateQueries() {
    return vi.spyOn(testQueryClient, 'invalidateQueries')
  },
}

const TestComponent = defineComponent({
  props: {
    shouldPassSearchFilters: Boolean,
  },
  setup() {
    const mutation = useCreateFinanceRecordMutation()
    mutation.mutate(financeRecord)
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

test('makes a POST request to the expected endpoint', async () => {
  const postSpy = spyOn.post()

  mountWithProviders()

  await flushPromises()

  expect(postSpy).toHaveBeenCalledWith(financeRecordAPIRoutes.postFinanceRecord(), financeRecord)
})

test('invalidates the expected query keys', async () => {
  spyOn.post()
  const invalidateSpy = spyOn.invalidateQueries()
  const searchProvider = useSearchFinanceRecordsProvider()

  mountWithProviders({ searchProvider })

  await flushPromises()

  expect(invalidateSpy).toHaveBeenCalledTimes(2)

  expect(invalidateSpy).toHaveBeenCalledWith({
    queryKey: financeRecordQueryKeys.listByFilters({ filters: searchProvider.filters }),
  })
  expect(invalidateSpy).toHaveBeenCalledWith({
    queryKey: financeRecordQueryKeys.stats({ filters: searchProvider.filters }),
  })
})
