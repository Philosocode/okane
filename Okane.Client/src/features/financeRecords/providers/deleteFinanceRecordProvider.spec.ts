// Internal
import { useDeleteFinanceRecordProvider } from '@features/financeRecords/providers/deleteFinanceRecordProvider'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'

test('returns a function to set the deleting finance record id', () => {
  const provider = useDeleteFinanceRecordProvider()
  expect(provider.financeRecordToDelete).toBeUndefined()

  const financeRecord = createTestFinanceRecord()
  provider.setFinanceRecordToDelete(financeRecord)
  expect(provider.financeRecordToDelete).toEqual(financeRecord)
})
