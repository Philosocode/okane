// Internal
import type {
  PreCreationFinanceRecord,
  SaveFinanceRecordFormState,
} from '@features/financeRecords/types/financeRecord.types'

export function mapSaveFinanceRecordFormStateToFinanceRecord(
  formState: SaveFinanceRecordFormState,
): PreCreationFinanceRecord {
  return { ...formState, happenedAt: new Date(formState.happenedAt) }
}
