// External
import { defineComponent, toRef } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { FINANCE_RECORD_API_ROUTES } from '@features/financeRecords/constants/apiRoutes'

import { useCreateFinanceRecordMutation } from '@features/financeRecords/composables/useCreateFinanceRecordMutation'

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

const queryKey = toRef(['a'])

const TestComponent = defineComponent({
  props: {
    shouldPassSearchFilters: Boolean,
  },
  setup() {
    const mutation = useCreateFinanceRecordMutation(queryKey)
    mutation.mutate(financeRecord)
  },
  template: '<div />',
})

function mountComponent() {
  return getMountComponent(TestComponent, { withQueryClient: true })()
}

test('makes a POST request to the expected endpoint', async () => {
  const postSpy = spyOn.post()

  mountComponent()

  await flushPromises()

  expect(postSpy).toHaveBeenCalledWith(
    FINANCE_RECORD_API_ROUTES.POST_FINANCE_RECORD.buildPath(),
    financeRecord,
  )
})

test('invalidates the query key when search filters are passed', async () => {
  spyOn.post()

  const invalidateSpy = spyOn.invalidateQueries()

  mountComponent()

  await flushPromises()

  expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKey.value })
})
