// Internal
import { useSaveFinanceRecordStore } from '@features/financeRecords/composables/useSaveFinanceRecordStore'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'

describe('setIsCreating', () => {
  test('updates the isCreating state', () => {
    const store = useSaveFinanceRecordStore()

    store.setIsCreating(true)
    expect(store.isCreating).toBe(true)

    store.setIsCreating(false)
    expect(store.isCreating).toBe(false)
  })
})

describe('setEditingFinanceRecord', () => {
  test('updates the editingFinanceRecord state', () => {
    const financeRecord = createTestFinanceRecord()
    const store = useSaveFinanceRecordStore()

    store.setEditingFinanceRecord(financeRecord)
    expect(store.editingFinanceRecord).toEqual(financeRecord)

    store.setEditingFinanceRecord(undefined)
    expect(store.editingFinanceRecord).toBeUndefined()
  })
})
