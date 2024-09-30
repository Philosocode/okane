// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import * as utils from '@features/financeRecords/utils/saveFinanceRecord'
import { mapDate } from '@shared/utils/dateTime'

describe('getInitialSaveFinanceRecordFormState', () => {
  test('returns the initial form state', () => {
    const spy = vi.spyOn(Date, 'now').mockReturnValue(540)

    expect(utils.getInitialSaveFinanceRecordFormState()).toEqual({
      amount: 0,
      description: '',
      happenedAt: mapDate.to.dateTimeLocal(new Date(Date.now())),
      type: FINANCE_RECORD_TYPE.EXPENSE,
    })

    spy.mockRestore()
  })
})

describe('getSaveFinanceRecordFormChanges', () => {
  const initialForm = utils.getInitialSaveFinanceRecordFormState()

  test('returns false if no changes have been made', () => {
    expect(utils.getSaveFinanceRecordFormChanges(initialForm, { ...initialForm })).toEqual({
      changes: {},
      hasChanges: false,
    })
  })

  test.each([
    { updatedField: 'amount', changes: { amount: initialForm.amount + 1 } },
    { updatedField: 'description', changes: { description: initialForm.description + 'A' } },
    {
      updatedField: 'happenedAt',
      changes: { happenedAt: mapDate.to.dateTimeLocal(new Date('2024-01-01')) },
    },
    {
      updatedField: 'type',
      changes: { type: FINANCE_RECORD_TYPE.REVENUE },
    },
  ])('returns true if updatedField has changed', (data) => {
    const result = utils.getSaveFinanceRecordFormChanges(initialForm, {
      ...initialForm,
      ...data.changes,
    })
    expect(result).toEqual({
      changes: data.changes,
      hasChanges: true,
    })
  })

  test('returns true if multiple fields have changed', () => {
    const changes = { amount: initialForm.amount + 1, description: initialForm.description + 'A' }
    const result = utils.getSaveFinanceRecordFormChanges(initialForm, {
      ...initialForm,
      ...changes,
    })
    expect(result).toEqual({
      changes,
      hasChanges: true,
    })
  })
})
