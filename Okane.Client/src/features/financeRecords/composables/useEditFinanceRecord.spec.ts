// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { useEditFinanceRecord } from '@features/financeRecords/composables/useEditFinanceRecord'

import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  type FinanceRecordSearchFiltersProvider,
  useFinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { wrapInApiResponse } from '@tests/utils/apiResponse'
import { mapSaveFinanceRecordFormState } from '@features/financeRecords/utils/mappers'

const spyOn = {
  patch() {
    return vi.spyOn(apiClient, 'patch').mockResolvedValue(wrapInApiResponse('ok'))
  },
  invalidateQueries() {
    return vi.spyOn(testQueryClient, 'invalidateQueries')
  },
}

const changes = { amount: '99' }
const request = mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(changes)
const id = 540

const TestComponent = defineComponent({
  props: {
    shouldPassSearchFilters: Boolean,
  },
  setup() {
    const mutation = useEditFinanceRecord()
    mutation.mutate({ id, request })
  },
  template: '<div />',
})

function mountWithProviders(args: { searchProvider?: FinanceRecordSearchFiltersProvider } = {}) {
  let searchProvider = args.searchProvider
  if (!searchProvider) searchProvider = useFinanceRecordSearchFiltersProvider()

  return getMountComponent(TestComponent, {
    global: {
      provide: {
        [FINANCE_RECORD_SEARCH_FILTERS_SYMBOL]: searchProvider,
      },
    },
    withQueryClient: true,
  })()
}

test('makes a PATCH request to the expected endpoint', async () => {
  const patchSpy = spyOn.patch()

  mountWithProviders()
  await flushPromises()
  expect(patchSpy).toHaveBeenCalledWith(financeRecordApiRoutes.patchFinanceRecord({ id }), {
    amount: parseFloat(changes.amount),
  })
})

test('invalidates the expected query keys', async () => {
  spyOn.patch()
  const invalidateSpy = spyOn.invalidateQueries()
  const searchProvider = useFinanceRecordSearchFiltersProvider()

  mountWithProviders()
  await flushPromises()

  expect(invalidateSpy).toHaveBeenCalledTimes(2)
  expect(invalidateSpy).toHaveBeenCalledWith({
    queryKey: financeRecordQueryKeys.listByFilters({ filters: searchProvider.filters }),
  })
  expect(invalidateSpy).toHaveBeenCalledWith({
    queryKey: financeRecordQueryKeys.stats({ filters: searchProvider.filters }),
  })
})
