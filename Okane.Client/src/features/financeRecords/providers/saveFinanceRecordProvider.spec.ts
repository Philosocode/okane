// Internal
import { useSaveFinanceRecordProvider } from '@features/financeRecords/providers/saveFinanceRecordProvider'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'

describe('setIsCreating', () => {
  test('updates the isCreating state', () => {
    const provider = useSaveFinanceRecordProvider()

    provider.setIsCreating(true)
    expect(provider.isCreating).toBe(true)

    provider.setIsCreating(false)
    expect(provider.isCreating).toBe(false)
  })
})

describe('setEditingFinanceRecord', () => {
  test('updates the editingFinanceRecord state', () => {
    const financeRecord = createTestFinanceRecord()
    const provider = useSaveFinanceRecordProvider()

    provider.setEditingFinanceRecord(financeRecord)
    expect(provider.editingFinanceRecord).toEqual(financeRecord)

    provider.setEditingFinanceRecord(undefined)
    expect(provider.editingFinanceRecord).toBeUndefined()
  })
})
