// Internal
import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import type { TestObjectFactoryFunction } from '@tests/factories/base'

import { baseTestObjectFactory } from '@tests/factories/base'
import { dateToDateTimeLocalFormat } from '@shared/utils/dateTime'
import type { SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

const defaultFinanceRecord: FinanceRecord = {
  id: 1,
  amount: 540.72,
  description: 'Expensive expense',
  type: FINANCE_RECORD_TYPE.EXPENSE,
  happenedAt: new Date(),
}

export const createTestFinanceRecord: TestObjectFactoryFunction<FinanceRecord> = (
  overrides,
  options,
): FinanceRecord => {
  return baseTestObjectFactory(defaultFinanceRecord, overrides, options)
}

const defaultSaveFinanceRecordFormState: SaveFinanceRecordFormState = {
  amount: defaultFinanceRecord.amount,
  description: defaultFinanceRecord.description,
  type: defaultFinanceRecord.type,
  happenedAt: dateToDateTimeLocalFormat(defaultFinanceRecord.happenedAt),
}

export const createTestSaveFinanceRecordFormState: TestObjectFactoryFunction<
  SaveFinanceRecordFormState
> = (overrides, options) => {
  return baseTestObjectFactory(defaultSaveFinanceRecordFormState, overrides, options)
}
