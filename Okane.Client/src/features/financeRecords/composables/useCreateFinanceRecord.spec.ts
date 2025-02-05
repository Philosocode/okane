// External
import { flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { useCreateFinanceRecord } from '@features/financeRecords/composables/useCreateFinanceRecord'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { mapSaveFinanceRecordFormState } from '@features/financeRecords/utils/mappers'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { createTestSaveFinanceRecordFormState } from '@tests/factories/financeRecord'
import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { wrapInApiResponse } from '@tests/utils/apiResponse'

const formState = createTestSaveFinanceRecordFormState()
const request = mapSaveFinanceRecordFormState.to.createFinanceRecordRequest(formState)

const spyOn = {
  post() {
    return vi.spyOn(apiClient, 'post').mockResolvedValue(wrapInApiResponse('ok'))
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
    const mutation = useCreateFinanceRecord()
    mutation.mutate(request)
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

  expect(postSpy).toHaveBeenCalledWith(financeRecordApiRoutes.postFinanceRecord(), request)
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
