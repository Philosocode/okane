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

describe('setFinanceRecordToEdit', () => {
  test('updates the financeRecordToEdit state', () => {
    const financeRecord = createTestFinanceRecord()
    const provider = useSaveFinanceRecordProvider()

    provider.setFinanceRecordToEdit(financeRecord)
    expect(provider.financeRecordToEdit).toEqual(financeRecord)

    provider.setFinanceRecordToEdit(undefined)
    expect(provider.financeRecordToEdit).toBeUndefined()
  })
})
