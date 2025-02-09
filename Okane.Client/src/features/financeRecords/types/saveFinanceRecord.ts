// Internal
import { type FormErrors } from '@shared/types/form'
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import { type FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { type Tag } from '@shared/types/tag'

export type SaveFinanceRecordFormState = {
  amount: string
  description: string
  happenedAt: string
  tags: Tag[]
  type: FINANCE_RECORD_TYPE
}

export type SaveFinanceRecordFormErrors = FormErrors<SaveFinanceRecordFormState>

export type CreateFinanceRecordRequest = Omit<FinanceRecord, 'id' | 'tags'> & {
  tagIds: number[]
}

export type EditFinanceRecordRequest = Partial<CreateFinanceRecordRequest>
