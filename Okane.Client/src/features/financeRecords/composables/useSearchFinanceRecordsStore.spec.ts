// Internal
import { useSearchFinanceRecordsStore } from '@features/financeRecords/composables/useSearchFinanceRecordsStore'

test('returns the search filters', () => {
  const store = useSearchFinanceRecordsStore()
  expect(store.searchFilters).toEqual({})
})
