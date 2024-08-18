// Internal
import type {
  FinanceRecord,
  SaveFinanceRecordFormState,
} from '@features/financeRecords/types/financeRecord.types'

import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/financeRecord.constants'

import type { StubFactoryFunction } from '@tests/factories/base.factory'

import { baseStubFactory } from '@tests/factories/base.factory'
import { dateToDateTimeLocalFormat } from '@shared/utils/dateTime.utils'

const defaultFinanceRecord: FinanceRecord = {
  id: 1,
  amount: 540.72,
  description: 'Expensive expense',
  type: FINANCE_RECORD_TYPE.EXPENSE,
  happenedAt: new Date(),
}

export const createStubFinanceRecord: StubFactoryFunction<FinanceRecord> = (
  overrides,
  options,
): FinanceRecord => {
  return baseStubFactory(defaultFinanceRecord, overrides, options)
}

const defaultSaveFinanceRecordFormState: SaveFinanceRecordFormState = {
  amount: defaultFinanceRecord.amount,
  description: defaultFinanceRecord.description,
  type: defaultFinanceRecord.type,
  happenedAt: dateToDateTimeLocalFormat(defaultFinanceRecord.happenedAt),
}

export const createStubSaveFinanceRecordFormState: StubFactoryFunction<
  SaveFinanceRecordFormState
> = (overrides, options) => {
  return baseStubFactory(defaultSaveFinanceRecordFormState, overrides, options)
}
