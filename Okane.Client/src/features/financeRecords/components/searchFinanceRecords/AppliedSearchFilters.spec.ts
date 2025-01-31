// Internal
import AppliedAmountFilter from '@features/financeRecords/components/searchFinanceRecords/AppliedAmountFilter.vue'
import AppliedDescriptionFilter from '@features/financeRecords/components/searchFinanceRecords/AppliedDescriptionFilter.vue'
import AppliedHappenedAtFilter from '@features/financeRecords/components/searchFinanceRecords/AppliedHappenedAtFilter.vue'
import AppliedSearchFilters from '@features/financeRecords/components/searchFinanceRecords/AppliedSearchFilters.vue'
import AppliedSorting from '@features/financeRecords/components/searchFinanceRecords/AppliedSorting.vue'
import AppliedTagsFilter from '@features/financeRecords/components/searchFinanceRecords/AppliedTagsFilter.vue'
import AppliedTypeFilter from '@features/financeRecords/components/searchFinanceRecords/AppliedTypeFilter.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

const mountComponent = getMountComponent(AppliedSearchFilters, {
  global: {
    provide: {
      [SEARCH_FINANCE_RECORDS_SYMBOL]: useSearchFinanceRecordsProvider(),
    },
  },
})

test('renders a heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.findByText(
    'h3',
    FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.APPLIED_SEARCH_FILTERS,
  )
  expect(heading).toBeDefined()
})

test.each([
  // Sorted by order of appearance.
  { Component: AppliedTypeFilter, name: 'AppliedTypeFilter' },
  { Component: AppliedDescriptionFilter, name: 'AppliedDescriptionFilter' },
  { Component: AppliedAmountFilter, name: 'AppliedAmountFilter' },
  { Component: AppliedHappenedAtFilter, name: 'AppliedHappenedAtFilter' },
  { Component: AppliedTagsFilter, name: 'AppliedTagsFilter' },
  { Component: AppliedSorting, name: 'AppliedSorting' },
])('renders a $name', ({ Component }) => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(Component).exists()).toBe(true)
})
