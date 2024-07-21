// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/financeRecord.constants'

import type { FormErrors } from '@shared/types/form.types'

export type FinanceRecord = {
  amount: number
  description: string
  happenedAt: Date
  type: FINANCE_RECORD_TYPE
}

export type SaveFinanceRecordFormState = Omit<FinanceRecord, 'happenedAt'> & {
  happenedAt: string
}

export type SaveFinanceRecordFormErrors = FormErrors<SaveFinanceRecordFormState>
