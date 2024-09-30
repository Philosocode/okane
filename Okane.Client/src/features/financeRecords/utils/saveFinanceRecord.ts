// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { mapDate } from '@shared/utils/dateTime'

export function getInitialSaveFinanceRecordFormState(): SaveFinanceRecordFormState {
  return {
    amount: 0,
    description: '',
    happenedAt: mapDate.to.dateTimeLocal(new Date(Date.now())),
    type: FINANCE_RECORD_TYPE.EXPENSE,
  }
}

export function getSaveFinanceRecordFormChanges(
  initial: SaveFinanceRecordFormState,
  updated: SaveFinanceRecordFormState,
) {
  const changes: Partial<SaveFinanceRecordFormState> = {}

  if (initial.amount !== updated.amount) changes.amount = updated.amount
  if (initial.description !== updated.description) changes.description = updated.description
  if (initial.happenedAt !== updated.happenedAt) changes.happenedAt = updated.happenedAt
  if (initial.type !== updated.type) changes.type = updated.type

  return {
    changes,
    hasChanges: Object.keys(changes).length > 0,
  }
}
