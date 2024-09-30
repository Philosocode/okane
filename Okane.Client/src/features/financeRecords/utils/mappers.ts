// Internal
import type { SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import type { FinanceRecord } from '@features/financeRecords/types/financeRecord'

import { createMappers } from '@shared/utils/mappers'
import { mapDate } from '@shared/utils/dateTime'

export const mapFinanceRecord = createMappers({
  saveFinanceRecordFormState(financeRecord: FinanceRecord): SaveFinanceRecordFormState {
    return {
      ...financeRecord,
      happenedAt: mapDate.to.dateTimeLocal(financeRecord.happenedAt),
    }
  },
})

export const mapSaveFinanceRecordFormState = createMappers({
  partialFinanceRecord(formState: Partial<SaveFinanceRecordFormState>): Partial<FinanceRecord> {
    const { happenedAt, ...rest } = formState
    return {
      ...rest,
      ...(happenedAt && { happenedAt: new Date(happenedAt) }),
    }
  },
  preCreationFinanceRecord(formState: SaveFinanceRecordFormState) {
    return { ...formState, happenedAt: new Date(formState.happenedAt) }
  },
})
