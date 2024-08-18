// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/financeRecord.constants'

import type { FormErrors } from '@shared/types/form.types'

export type FinanceRecord = {
  id: number
  amount: number
  description: string
  happenedAt: Date
  type: FINANCE_RECORD_TYPE
}

export type SaveFinanceRecordFormState = Omit<FinanceRecord, 'id' | 'happenedAt'> & {
  happenedAt: string
}

export type SaveFinanceRecordFormErrors = FormErrors<SaveFinanceRecordFormState>
