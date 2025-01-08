// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { type Tag } from '@shared/types/tag'

export type FinanceUserTag = {
  id: number
  tag: Tag
  type: FINANCE_RECORD_TYPE
}

export type FinanceUserTagMap = Record<FINANCE_RECORD_TYPE, FinanceUserTag[]>

export type CreateFinanceUserTagRequest = {
  name: string
  type: FINANCE_RECORD_TYPE
}
