// Internal
import { useDeleteFinanceRecordStore } from '@features/financeRecords/composables/useDeleteFinanceRecordStore'

test('setDeletingFinanceRecordId', () => {
  const store = useDeleteFinanceRecordStore()

  expect(store.financeRecordId).toBeUndefined()

  const id = 2
  store.setDeletingFinanceRecordId(id)
  expect(store.financeRecordId).toBe(id)
})

test('clearDeletingFinanceRecordId', () => {
  const store = useDeleteFinanceRecordStore()

  store.setDeletingFinanceRecordId(2)
  store.clearDeletingFinanceRecordId()
  expect(store.financeRecordId).toBeUndefined()
})
