// External
import { defineComponent, toRef } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { useEditFinanceRecordMutation } from '@features/financeRecords/composables/useEditFinanceRecordMutation'

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

const queryKey = toRef(['a'])

const changes: Partial<FinanceRecord> = { amount: 99 }
const id = 540

const TestComponent = defineComponent({
  props: {
    shouldPassSearchFilters: Boolean,
  },
  setup() {
    const mutation = useEditFinanceRecordMutation(queryKey)
    mutation.mutate({ changes, id })
  },
  template: '<div />',
})

function mountComponent() {
  return getMountComponent(TestComponent, { withQueryClient: true })()
}

test('makes a PATCH request to the expected endpoint', async () => {
  const patchSpy = spyOn.patch()

  mountComponent()
  await flushPromises()
  expect(patchSpy).toHaveBeenCalledWith(financeRecordAPIRoutes.patchFinanceRecord({ id }), changes)

  patchSpy.mockRestore()
})

test('invalidates the query key when search filters are passed', async () => {
  const patchSpy = spyOn.patch()
  const invalidateSpy = spyOn.invalidateQueries()

  mountComponent()
  await flushPromises()
  expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKey.value })

  patchSpy.mockRestore()
  invalidateSpy.mockRestore()
})
