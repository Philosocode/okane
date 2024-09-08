// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import * as utils from '@features/financeRecords/utils/mappers'
import { dateToDateTimeLocalFormat } from '@shared/utils/dateTime'
import {
  createTestFinanceRecord,
  createTestSaveFinanceRecordFormState,
} from '@tests/factories/financeRecord'

describe('mapFinanceRecord', () => {
  test('saveFinanceRecordFormState', () => {
    const financeRecord = createTestFinanceRecord()
    const result = utils.mapFinanceRecord.to.saveFinanceRecordFormState(financeRecord)
    expect(result).toEqual({
      ...financeRecord,
      happenedAt: dateToDateTimeLocalFormat(financeRecord.happenedAt),
    })
  })
})

describe('mapSaveFinanceRecordFormState', () => {
  test('preCreationFinanceRecord', () => {
    const formState = createTestSaveFinanceRecordFormState()
    const result = utils.mapSaveFinanceRecordFormState.to.preCreationFinanceRecord(formState)
    expect(result).toEqual({
      ...result,
      happenedAt: new Date(formState.happenedAt),
    })
  })

  describe('partialFinanceRecord', () => {
    test('ignores happenedAt if undefined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = {
        amount: 0,
        type: FINANCE_RECORD_TYPE.EXPENSE,
      }
      const result = utils.mapSaveFinanceRecordFormState.to.partialFinanceRecord(changes)
      expect(result).toEqual(changes)
    })

    test('converts happenedAt to a date if defined', () => {
      const changes: Partial<SaveFinanceRecordFormState> = {
        amount: 0,
        happenedAt: '2018-06-12T19:30',
        type: FINANCE_RECORD_TYPE.EXPENSE,
      }
      const result = utils.mapSaveFinanceRecordFormState.to.partialFinanceRecord(changes)
      expect(result).toEqual({
        amount: changes.amount,
        happenedAt: new Date(changes.happenedAt ?? 0),
        type: changes.type,
      })
    })
  })
})
