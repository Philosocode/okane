// Internal
import { useSaveFinanceRecord } from '@features/financeRecords/composables/useSaveFinanceRecord.composable'

import { apiClient } from '@shared/services/apiClient/apiClient.service'

import { createStubFinanceRecord } from '@tests/factories/financeRecord.factory'
import { wrapInAPIResponse } from '@tests/factories/apiResponse.factory'

test('makes a POST request to the expected endpoint', async () => {
  const mockedResponse = wrapInAPIResponse('ok')
  const spy = vi.spyOn(apiClient, 'post').mockResolvedValue(mockedResponse)

  const { saveFinanceRecord } = useSaveFinanceRecord()
  const financeRecord = createStubFinanceRecord()

  const response = await saveFinanceRecord(financeRecord)

  expect(spy).toHaveBeenCalledWith('/finance-records', financeRecord)
  expect(response).toEqual(mockedResponse)
})
