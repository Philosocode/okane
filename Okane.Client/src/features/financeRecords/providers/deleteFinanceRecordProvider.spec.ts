// Internal
import { useDeleteFinanceRecordId } from '@features/financeRecords/providers/deleteFinanceRecordIdProvider'

test('returns a function to set the deleting finance record id', () => {
  const provider = useDeleteFinanceRecordId()
  expect(provider.id).toBeUndefined()

  provider.setId(1)
  expect(provider.id).toBe(1)
})
