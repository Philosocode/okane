// External
import { flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'

// Internal
import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'

import { useCreateFinanceRecord } from '@features/financeRecords/composables/useCreateFinanceRecord'

import { mapSaveFinanceRecordFormState } from '@features/financeRecords/utils/mappers'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { createTestSaveFinanceRecordFormState } from '@tests/factories/financeRecord'
import { testQueryClient } from '@tests/queryClient/testQueryClient'
import { wrapInApiResponse } from '@tests/utils/apiResponse'
import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'

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

const mountComponent = getMountComponent(TestComponent, {
  withQueryClient: true,
})

test('makes a POST request to the expected endpoint', async () => {
  const postSpy = spyOn.post()

  mountComponent()

  await flushPromises()

  expect(postSpy).toHaveBeenCalledWith(financeRecordApiRoutes.postFinanceRecord(), request)
})

test('invalidates the expected query keys', async () => {
  spyOn.post()
  const invalidateSpy = spyOn.invalidateQueries()
  const searchStore = useFinanceRecordSearchStore()

  mountComponent()

  await flushPromises()

  expect(invalidateSpy).toHaveBeenCalledTimes(2)

  expect(invalidateSpy).toHaveBeenCalledWith({
    queryKey: financeRecordQueryKeys.listByFilters({ filters: searchStore.filters }),
  })
  expect(invalidateSpy).toHaveBeenCalledWith({
    queryKey: financeRecordQueryKeys.stats({ filters: searchStore.filters }),
  })
})
