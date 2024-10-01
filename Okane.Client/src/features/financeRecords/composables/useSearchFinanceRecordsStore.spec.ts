// Internal
import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFinanceRecords'

import { useSearchFinanceRecordsStore } from '@features/financeRecords/composables/useSearchFinanceRecordsStore'

test('returns the search filters', () => {
  const store = useSearchFinanceRecordsStore()
  expect(store.searchFilters).toEqual(DEFAULT_FINANCE_RECORD_SEARCH_FILTERS)
})

test('returns the search modal display state', () => {
  const store = useSearchFinanceRecordsStore()
  expect(store.modalIsShowing).toBe(false)
})

test('returns a function to update the search modal display state', () => {
  const store = useSearchFinanceRecordsStore()
  store.setModalIsShowing(true)
  expect(store.modalIsShowing).toBe(true)

  store.setModalIsShowing(false)
  expect(store.modalIsShowing).toBe(false)
})
