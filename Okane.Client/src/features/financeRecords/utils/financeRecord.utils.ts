// Internal
import type {
  FinanceRecord,
  SaveFinanceRecordFormState,
} from '@features/financeRecords/types/financeRecord.types'

export function mapSaveFinanceRecordFormStateToFinanceRecord(
  formState: SaveFinanceRecordFormState,
): FinanceRecord {
  return { ...formState, happenedAt: new Date(formState.happenedAt) }
}
