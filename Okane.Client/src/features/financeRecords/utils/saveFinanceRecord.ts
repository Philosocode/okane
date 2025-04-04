// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'
import { type Tag } from '@shared/types/tag'

import { mapDate } from '@shared/utils/dateTime'

export function getInitialSaveFinanceRecordFormState(): SaveFinanceRecordFormState {
  return {
    amount: '0',
    description: '',
    happenedAt: mapDate.to.dateTimeLocal(new Date(Date.now())),
    tags: [],
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
  if (tagsHaveChanged(initial.tags, updated.tags)) changes.tags = updated.tags
  if (initial.type !== updated.type) changes.type = updated.type

  return {
    changes,
    hasChanges: Object.keys(changes).length > 0,
  }
}

function tagsHaveChanged(tags1: Tag[], tags2: Tag[]): boolean {
  if (tags1.length !== tags2.length) return true

  const tags1Ids = new Set<number>()
  const tags2Ids = new Set<number>()

  for (let i = 0; i < tags1.length; i++) {
    tags1Ids.add(tags1[i].id)
    tags2Ids.add(tags2[i].id)
  }

  for (let i = 0; i < tags1.length; i++) {
    if (!tags1Ids.has(tags2[i].id)) return true
    if (!tags2Ids.has(tags1[i].id)) return true
  }

  return false
}
