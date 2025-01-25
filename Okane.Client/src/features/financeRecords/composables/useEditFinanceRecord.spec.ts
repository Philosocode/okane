// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { useEditFinanceRecord } from '@features/financeRecords/composables/useEditFinanceRecord'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  type SearchFinanceRecordsProvider,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'
import { mapSaveFinanceRecordFormState } from '@features/financeRecords/utils/mappers'

const spyOn = {
  patch() {
    return vi.spyOn(apiClient, 'patch').mockResolvedValue(wrapInAPIResponse('ok'))
  },
  invalidateQueries() {
    return vi.spyOn(testQueryClient, 'invalidateQueries')
  },
}

const changes: Partial<SaveFinanceRecordFormState> = { amount: 99 }
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
})

test('invalidates the expected query keys', async () => {
  const patchSpy = spyOn.patch()
  const invalidateSpy = spyOn.invalidateQueries()
  const searchProvider = useSearchFinanceRecordsProvider()

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
