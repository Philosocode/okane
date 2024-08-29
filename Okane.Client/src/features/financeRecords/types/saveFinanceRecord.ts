// Internal
import type { FormErrors } from '@shared/types/form'
import type { PreCreationEntity } from '@shared/types/entity'
import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'

export type PreCreationFinanceRecord = PreCreationEntity<FinanceRecord>

export type SaveFinanceRecordFormState = Omit<PreCreationFinanceRecord, 'happenedAt'> & {
  happenedAt: string
}

export type SaveFinanceRecordFormErrors = FormErrors<SaveFinanceRecordFormState>
