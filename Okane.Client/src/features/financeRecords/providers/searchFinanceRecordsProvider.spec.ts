// Internal
import { DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFinanceRecords'

import { useSearchFinanceRecordsProvider } from '@features/financeRecords/providers/searchFinanceRecordsProvider'

test('returns the search filters', () => {
  const provider = useSearchFinanceRecordsProvider()
  expect(provider.filters).toEqual(DEFAULT_FINANCE_RECORDS_SEARCH_FILTERS)
})

test('returns the search modal display state', () => {
  const provider = useSearchFinanceRecordsProvider()
  expect(provider.modalIsShowing).toBe(false)
})

test('returns a function to update the search modal display state', () => {
  const provider = useSearchFinanceRecordsProvider()
  provider.setModalIsShowing(true)
  expect(provider.modalIsShowing).toBe(true)

  provider.setModalIsShowing(false)
  expect(provider.modalIsShowing).toBe(false)
})
