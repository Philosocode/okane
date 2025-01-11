// Internal
import { type FormErrors } from '@shared/types/form'
import { type FinanceRecord } from '@features/financeRecords/types/financeRecord'
import { type PreCreationEntity } from '@shared/types/entity'

export type CreateFinanceRecordRequest = PreCreationEntity<FinanceRecord>

export type SaveFinanceRecordFormState = Omit<CreateFinanceRecordRequest, 'happenedAt'> & {
  happenedAt: string
}

export type SaveFinanceRecordFormErrors = FormErrors<SaveFinanceRecordFormState>
