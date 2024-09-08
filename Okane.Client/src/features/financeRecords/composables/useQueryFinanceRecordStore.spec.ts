// Internal
import { useQueryFinanceRecordStore } from '@features/financeRecords/composables/useQueryFinanceRecordStore'

test('returns the search filters', () => {
  const store = useQueryFinanceRecordStore()
  expect(store.searchFilters).toEqual({})
})
