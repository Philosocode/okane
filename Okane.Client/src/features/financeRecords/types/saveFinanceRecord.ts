// Internal
import { type FormErrors } from '@shared/types/form'
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'

export type SaveFinanceRecordFormState = Omit<FinanceRecord, 'id' | 'happenedAt'> & {
  happenedAt: string
}

export type SaveFinanceRecordFormErrors = FormErrors<SaveFinanceRecordFormState>

export type CreateFinanceRecordRequest = Omit<FinanceRecord, 'id' | 'tags'> & {
  tagIds: number[]
}

export type EditFinanceRecordRequest = Partial<CreateFinanceRecordRequest>
