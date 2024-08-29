// Internal
import type { SelectOption } from '@shared/components/form/FormSelect.vue'

export enum FINANCE_RECORD_TYPE {
  EXPENSE = 'Expense',
  REVENUE = 'Revenue',
}

export const FINANCE_RECORD_TYPE_OPTIONS: SelectOption[] = Object.values(FINANCE_RECORD_TYPE).map(
  (type) => ({
    value: type,
    label: type,
  }),
)

export const FINANCE_RECORD_DESCRIPTION_MAX_LENGTH = 100
export const FINANCE_RECORD_MIN_AMOUNT = 0.01
export const FINANCE_RECORD_MAX_AMOUNT = 9_999_999.99
