// Internal
import Heading from '@shared/components/Heading.vue'
import SearchFinanceRecordsSummary from '@features/financeRecords/components/SearchFinanceRecordsSummary.vue'

import { COMPARISON_OPERATOR } from '@shared/constants/search'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { SHARED_COPY } from '@shared/constants/copy'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  useSearchFinanceRecordsProvider,
  type SearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import { capitalize } from '@shared/utils/string'

function mountWithProviders(
  args: {
    searchProvider: SearchFinanceRecordsProvider
  } = {
    searchProvider: useSearchFinanceRecordsProvider(),
  },
) {
  return getMountComponent(SearchFinanceRecordsSummary, {
    global: {
      provide: {
        [SEARCH_FINANCE_RECORDS_SYMBOL]: args.searchProvider,
      },
    },
  })()
}

const helpers = {
  getDateTimeFormatter() {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
  },
}

test('renders the expected heading', () => {
  const wrapper = mountWithProviders()
  const heading = wrapper.getComponent(Heading)
  expect(heading.text()).toBe(FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.APPLIED_SEARCH_FILTERS)
})

test('does not render missing fields', () => {
  const searchProvider = useSearchFinanceRecordsProvider()
  searchProvider.setFilters({ happenedAt1: undefined })

  const wrapper = mountWithProviders({ searchProvider })
  const missingFields = [
    FINANCES_COPY.PROPERTIES.DESCRIPTION,
    FINANCES_COPY.PROPERTIES.AMOUNT,
    FINANCES_COPY.PROPERTIES.HAPPENED_AT,
  ]
  missingFields.forEach((missingField) => {
    const li = wrapper.findByText('li', `${missingField}:`, { isExact: false })
    expect(li).toBeUndefined()
  })
})

test('renders a default type of all', () => {
  const wrapper = mountWithProviders()
  const text = `${FINANCES_COPY.PROPERTIES.TYPE}: ${capitalize(SHARED_COPY.COMMON.ALL)}`
  const li = wrapper.findByText('li', text)
  expect(li).toBeDefined()
})

test('renders a specific type', () => {
  const searchProvider = useSearchFinanceRecordsProvider()
  searchProvider.setFilters({ type: FINANCE_RECORD_TYPE.REVENUE })

  const wrapper = mountWithProviders({ searchProvider })
  const text = `${FINANCES_COPY.PROPERTIES.TYPE}: ${searchProvider.filters.type}`
  const li = wrapper.findByText('li', text)
  expect(li).toBeDefined()
})

test('renders the sortDirection and sortField', () => {
  const searchProvider = useSearchFinanceRecordsProvider()
  const { filters } = searchProvider
  const wrapper = mountWithProviders({ searchProvider })
  const text = `${SHARED_COPY.SEARCH.SORT_BY}: ${filters.sortField}, ${filters.sortDirection}`
  const li = wrapper.findByText('li', text)
  expect(li).toBeDefined()
})

test('renders a description when passed', () => {
  const searchProvider = useSearchFinanceRecordsProvider()
  searchProvider.setFilters({ description: 'Cool description' })

  const wrapper = mountWithProviders({ searchProvider })
  const text = `${FINANCES_COPY.PROPERTIES.DESCRIPTION}: ${searchProvider.filters.description}`
  const li = wrapper.findByText('li', text)
  expect(li).toBeDefined()
})

test('renders an amount with operator', () => {
  const amount1 = 1
  const operator = COMPARISON_OPERATOR.GTE
  const searchProvider = useSearchFinanceRecordsProvider()
  searchProvider.setFilters({
    amount1,
    amount2: 2,
    amountOperator: operator,
  })

  const wrapper = mountWithProviders({ searchProvider })
  const text = `${FINANCES_COPY.PROPERTIES.AMOUNT}: ${operator} ${amount1.toFixed(2)}`
  const li = wrapper.findByText('li', text, { isExact: true })
  expect(li).toBeDefined()
})

test('renders an amount range', () => {
  const amount1 = 1
  const amount2 = 2
  const searchProvider = useSearchFinanceRecordsProvider()
  searchProvider.setFilters({
    amount1,
    amount2,
    amountOperator: undefined,
  })

  const wrapper = mountWithProviders({ searchProvider })
  const textParts = [
    `${FINANCES_COPY.PROPERTIES.AMOUNT}:`,
    COMPARISON_OPERATOR.GTE,
    `$${amount1.toFixed(2)}`,
    SHARED_COPY.CONJUNCTIONS.AND.toUpperCase(),
    COMPARISON_OPERATOR.LTE,
    `$${amount2.toFixed(2)}`,
  ]

  const text = textParts.join(' ')
  const li = wrapper.findByText('li', text, { isExact: true })
  expect(li).toBeDefined()
})

test('renders a happenedAt with operator', () => {
  const happenedAt1 = new Date('2024-01-01')
  const operator = COMPARISON_OPERATOR.GTE
  const searchProvider = useSearchFinanceRecordsProvider()
  searchProvider.setFilters({
    happenedAt1,
    happenedAt2: new Date('2025-01-01'),
    happenedAtOperator: operator,
  })

  const formatter = helpers.getDateTimeFormatter()
  const wrapper = mountWithProviders({ searchProvider })
  const text = `${FINANCES_COPY.PROPERTIES.HAPPENED_AT}: ${operator} ${formatter.format(happenedAt1)}`
  const li = wrapper.findByText('li', text, { isExact: true })
  expect(li).toBeDefined()
})

test('renders a happenedAt range', () => {
  const happenedAt1 = new Date('2024-01-01')
  const happenedAt2 = new Date('2025-01-01')
  const searchProvider = useSearchFinanceRecordsProvider()
  searchProvider.setFilters({
    happenedAt1,
    happenedAt2,
    happenedAtOperator: undefined,
  })

  const formatter = helpers.getDateTimeFormatter()
  const wrapper = mountWithProviders({ searchProvider })
  const textParts = [
    `${FINANCES_COPY.PROPERTIES.HAPPENED_AT}:`,
    COMPARISON_OPERATOR.GTE,
    `${formatter.format(happenedAt1)}`,
    SHARED_COPY.CONJUNCTIONS.AND.toUpperCase(),
    COMPARISON_OPERATOR.LTE,
    `${formatter.format(happenedAt2)}`,
  ]

  const text = textParts.join(' ')
  const li = wrapper.findByText('li', text, { isExact: true })
  expect(li).toBeDefined()
})
