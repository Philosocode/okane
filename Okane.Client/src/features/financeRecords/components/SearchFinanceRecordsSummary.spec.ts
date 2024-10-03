// Internal
import Heading from '@shared/components/Heading.vue'
import SearchFinanceRecordsSummary from '@features/financeRecords/components/SearchFinanceRecordsSummary.vue'

import { COMPARISON_OPERATOR } from '@shared/constants/search'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { SHARED_COPY } from '@shared/constants/copy'

import { useSearchFinanceRecordsStore } from '@features/financeRecords/composables/useSearchFinanceRecordsStore'

import { capitalize } from '@shared/utils/string'

const mountComponent = getMountComponent(SearchFinanceRecordsSummary)

const helpers = {
  getDateTimeFormatter() {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' })
  },
}

test('renders the expected heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.getComponent(Heading)
  expect(heading.text()).toBe(FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.APPLIED_SEARCH_FILTERS)
})

test('does not render missing fields', () => {
  const searchStore = useSearchFinanceRecordsStore()
  searchStore.searchFilters.happenedAt1 = undefined

  const wrapper = mountComponent()
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
  const wrapper = mountComponent()
  const text = `${FINANCES_COPY.PROPERTIES.TYPE}: ${capitalize(SHARED_COPY.COMMON.ALL)}`
  const li = wrapper.findByText('li', text)
  expect(li).toBeDefined()
})

test('renders a specific type', () => {
  const searchStore = useSearchFinanceRecordsStore()
  searchStore.searchFilters.type = FINANCE_RECORD_TYPE.REVENUE

  const wrapper = mountComponent()
  const text = `${FINANCES_COPY.PROPERTIES.TYPE}: ${searchStore.searchFilters.type}`
  const li = wrapper.findByText('li', text)
  expect(li).toBeDefined()
})

test('renders the sortDirection and sortField', () => {
  const searchStore = useSearchFinanceRecordsStore()
  const { searchFilters } = searchStore

  const wrapper = mountComponent()
  const text = `${SHARED_COPY.SEARCH.SORT_BY}: ${searchFilters.sortField}, ${searchFilters.sortDirection}`
  const li = wrapper.findByText('li', text)
  expect(li).toBeDefined()
})

test('renders a description when passed', () => {
  const searchStore = useSearchFinanceRecordsStore()
  searchStore.searchFilters.description = 'Cool description'

  const wrapper = mountComponent()
  const text = `${FINANCES_COPY.PROPERTIES.DESCRIPTION}: ${searchStore.searchFilters.description}`
  const li = wrapper.findByText('li', text)
  expect(li).toBeDefined()
})

test('renders an amount with operator', () => {
  const searchStore = useSearchFinanceRecordsStore()
  const amount1 = 1
  const operator = COMPARISON_OPERATOR.GTE
  searchStore.searchFilters.amount1 = amount1
  searchStore.searchFilters.amount2 = 2
  searchStore.searchFilters.amountOperator = operator

  const wrapper = mountComponent()
  const text = `${FINANCES_COPY.PROPERTIES.AMOUNT}: ${operator} ${amount1.toFixed(2)}`
  const li = wrapper.findByText('li', text, { isExact: true })
  expect(li).toBeDefined()
})

test('renders an amount range', () => {
  const searchStore = useSearchFinanceRecordsStore()
  const amount1 = 1
  const amount2 = 2
  searchStore.searchFilters.amount1 = amount1
  searchStore.searchFilters.amount2 = amount2
  searchStore.searchFilters.amountOperator = undefined

  const wrapper = mountComponent()
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
  const searchStore = useSearchFinanceRecordsStore()
  const happenedAt1 = new Date('2024-01-01')
  const operator = COMPARISON_OPERATOR.GTE
  searchStore.searchFilters.happenedAt1 = happenedAt1
  searchStore.searchFilters.happenedAt2 = new Date('2025-01-01')
  searchStore.searchFilters.happenedAtOperator = operator

  const formatter = helpers.getDateTimeFormatter()
  const wrapper = mountComponent()
  const text = `${FINANCES_COPY.PROPERTIES.HAPPENED_AT}: ${operator} ${formatter.format(happenedAt1)}`
  const li = wrapper.findByText('li', text, { isExact: true })
  expect(li).toBeDefined()
})

test('renders a happenedAt range', () => {
  const searchStore = useSearchFinanceRecordsStore()
  const happenedAt1 = new Date('2024-01-01')
  const happenedAt2 = new Date('2025-01-01')
  searchStore.searchFilters.happenedAt1 = happenedAt1
  searchStore.searchFilters.happenedAt2 = happenedAt2
  searchStore.searchFilters.happenedAtOperator = undefined

  const formatter = helpers.getDateTimeFormatter()
  const wrapper = mountComponent()
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
