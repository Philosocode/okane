// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

export function isFinanceRecordType(value: string): value is FINANCE_RECORD_TYPE {
  return [FINANCE_RECORD_TYPE.EXPENSE.toString(), FINANCE_RECORD_TYPE.REVENUE.toString()].includes(
    value,
  )
}
