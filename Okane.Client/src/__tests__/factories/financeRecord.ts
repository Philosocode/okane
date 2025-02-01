// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'
import { type TestObjectFactoryFunction } from '@tests/factories/base'

import { mapDate } from '@shared/utils/dateTime'

import { baseTestObjectFactory } from '@tests/factories/base'
import { createTestTag } from '@tests/factories/tag'
import type { FinanceRecordsStats } from '@features/financeRecords/types/financeRecordsStats'

const defaultFinanceRecord: FinanceRecord = {
  id: 1,
  amount: 540.72,
  description: 'Expensive expense',
  tags: [createTestTag()],
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
  tags: defaultFinanceRecord.tags,
  type: defaultFinanceRecord.type,
  happenedAt: mapDate.to.dateTimeLocal(defaultFinanceRecord.happenedAt),
}

export const createTestSaveFinanceRecordFormState: TestObjectFactoryFunction<
  SaveFinanceRecordFormState
> = (overrides, options) => {
  return baseTestObjectFactory(defaultSaveFinanceRecordFormState, overrides, options)
}

const defaultFinanceRecordsStats: FinanceRecordsStats = {
  expenseRecords: 25,
  revenueRecords: 50,
  totalExpenses: 1000,
  totalRevenue: 2000,
}

export const createTestFinanceRecordsStats: TestObjectFactoryFunction<FinanceRecordsStats> = (
  overrides,
  options,
) => {
  return baseTestObjectFactory(defaultFinanceRecordsStats, overrides, options)
}
