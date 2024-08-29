// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

export type FinanceRecord = {
  id: number
  amount: number
  description: string
  happenedAt: Date
  type: FINANCE_RECORD_TYPE
}
