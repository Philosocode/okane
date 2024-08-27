// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/financeRecord.constants'

import type { FormErrors } from '@shared/types/form.types'
import type { PreCreationEntity } from '@shared/types/entity.types'

export type FinanceRecord = {
  id: number
  amount: number
  description: string
  happenedAt: Date
  type: FINANCE_RECORD_TYPE
}

export type PreCreationFinanceRecord = PreCreationEntity<FinanceRecord>

export type SaveFinanceRecordFormState = Omit<PreCreationFinanceRecord, 'happenedAt'> & {
  happenedAt: string
}

export type SaveFinanceRecordFormErrors = FormErrors<SaveFinanceRecordFormState>

export type FinanceRecordSearchFilters = {}
