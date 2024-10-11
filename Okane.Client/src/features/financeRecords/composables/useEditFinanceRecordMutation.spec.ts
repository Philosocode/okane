// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { useEditFinanceRecordMutation } from '@features/financeRecords/composables/useEditFinanceRecordMutation'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'

const spyOn = {
  patch() {
    return vi.spyOn(apiClient, 'patch').mockResolvedValue(wrapInAPIResponse('ok'))
  },
  invalidateQueries() {
    return vi.spyOn(testQueryClient, 'invalidateQueries')
  },
}

const changes: Partial<FinanceRecord> = { amount: 99 }
const id = 540

const TestComponent = defineComponent({
  props: {
    shouldPassSearchFilters: Boolean,
  },
  setup() {
    const mutation = useEditFinanceRecordMutation()
    mutation.mutate({ changes, id })
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

test('makes a PATCH request to the expected endpoint', async () => {
  const patchSpy = spyOn.patch()

  mountWithProviders()
  await flushPromises()
  expect(patchSpy).toHaveBeenCalledWith(financeRecordAPIRoutes.patchFinanceRecord({ id }), changes)

  patchSpy.mockRestore()
})

test('invalidates the expected query keys', async () => {
  const patchSpy = spyOn.patch()
  const invalidateSpy = spyOn.invalidateQueries()
  const searchProvider = useSearchFinanceRecordsProvider()

  mountWithProviders()
  await flushPromises()

  expect(invalidateSpy).toHaveBeenCalledTimes(2)
  expect(invalidateSpy).toHaveBeenCalledWith({
    queryKey: financeRecordQueryKeys.listByFilters(searchProvider.filters),
  })
  expect(invalidateSpy).toHaveBeenCalledWith({
    queryKey: financeRecordQueryKeys.stats(searchProvider.filters),
  })

  patchSpy.mockRestore()
  invalidateSpy.mockRestore()
})
