// Internal
import { type FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { type Tag } from '@shared/types/tag'

export type FinanceRecord = {
  id: number
  amount: number
  description: string
  happenedAt: Date
  tags: Tag[]
  type: FINANCE_RECORD_TYPE
}
