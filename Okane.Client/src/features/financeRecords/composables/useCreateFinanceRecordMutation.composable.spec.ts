// External
import { defineComponent } from 'vue'

// Internal
import { useCreateFinanceRecordMutation } from '@features/financeRecords/composables/useCreateFinanceRecordMutation.composable'

import { apiClient } from '@shared/services/apiClient/apiClient.service'

import { createStubFinanceRecord } from '@tests/factories/financeRecord.factory'
import { wrapInAPIResponse } from '@tests/factories/apiResponse.factory'
import { flushPromises } from '@vue/test-utils'

const financeRecord = createStubFinanceRecord()

const TestComponent = defineComponent({
  setup() {
    const mutation = useCreateFinanceRecordMutation()
    mutation.mutate(financeRecord)
  },
  template: '<div />',
})

test('makes a POST request to the expected endpoint', async () => {
  const mockedResponse = wrapInAPIResponse('ok')
  const spy = vi.spyOn(apiClient, 'post').mockResolvedValue(mockedResponse)

  getMountComponent(TestComponent, { withQueryClient: true })()

  await flushPromises()

  expect(spy).toHaveBeenCalledWith('/finance-records', financeRecord)
})
