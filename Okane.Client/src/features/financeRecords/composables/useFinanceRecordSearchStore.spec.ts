// Internal
import { useFinanceRecordSearchStore } from '@features/financeRecords/composables/useFinanceRecordSearchStore'

import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'

test('returns and updates search filters', () => {
  const store = useFinanceRecordSearchStore()
  expect(store.filters).toEqual(DEFAULT_FINANCE_RECORD_SEARCH_FILTERS)

  store.setFilters({ amount1: 10 })
  expect(store.filters).toEqual({
    ...DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
    amount1: 10,
  })
})

test('returns and updates modal state', () => {
  const store = useFinanceRecordSearchStore()
  expect(store.modalIsShowing).toBe(false)

  store.setModalIsShowing(true)
  expect(store.modalIsShowing).toBe(true)
})
