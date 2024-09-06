// Internal
import type {
  PreCreationFinanceRecord,
  SaveFinanceRecordFormState,
} from '@features/financeRecords/types/saveFinanceRecord'

export function mapSaveFinanceRecordFormStateToPreCreationFinanceRecord(
  formState: SaveFinanceRecordFormState,
): PreCreationFinanceRecord {
  return { ...formState, happenedAt: new Date(formState.happenedAt) }
}
