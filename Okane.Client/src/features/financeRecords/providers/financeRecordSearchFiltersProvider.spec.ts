// Internal
import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFilters'

import { useFinanceRecordSearchFiltersProvider } from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

test('returns the search filters', () => {
  const provider = useFinanceRecordSearchFiltersProvider()
  expect(provider.filters).toEqual(DEFAULT_FINANCE_RECORD_SEARCH_FILTERS)
})

test('returns the search modal display state', () => {
  const provider = useFinanceRecordSearchFiltersProvider()
  expect(provider.modalIsShowing).toBe(false)
})

test('returns a function to update the search modal display state', () => {
  const provider = useFinanceRecordSearchFiltersProvider()
  provider.setModalIsShowing(true)
  expect(provider.modalIsShowing).toBe(true)

  provider.setModalIsShowing(false)
  expect(provider.modalIsShowing).toBe(false)
})
