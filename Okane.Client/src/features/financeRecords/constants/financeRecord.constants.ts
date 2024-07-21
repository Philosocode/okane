// Internal
import type { SelectOption } from '@shared/components/form/FormSelect.vue'

export enum FINANCE_RECORD_TYPE {
  EXPENSE = 'expense',
  REVENUE = 'revenue',
}

export const FINANCE_RECORD_TYPE_OPTIONS: SelectOption[] = [
  {
    label: 'Expense',
    value: FINANCE_RECORD_TYPE.EXPENSE,
  },
  {
    label: 'Revenue',
    value: FINANCE_RECORD_TYPE.REVENUE,
  },
]

export const FINANCE_RECORD_MIN_AMOUNT = 0.01
export const FINANCE_RECORD_MAX_AMOUNT = 9_999_999.99
