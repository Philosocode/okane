// Internal
import AppliedAmountFilter from '@features/financeRecords/components/searchFilters/AppliedAmountFilter.vue'
import AppliedDescriptionFilter from '@features/financeRecords/components/searchFilters/AppliedDescriptionFilter.vue'
import AppliedHappenedAtFilter from '@features/financeRecords/components/searchFilters/AppliedHappenedAtFilter.vue'
import AppliedSearchFilters from '@features/financeRecords/components/searchFilters/AppliedSearchFilters.vue'
import AppliedSorting from '@features/financeRecords/components/searchFilters/AppliedSorting.vue'
import AppliedTagsFilter from '@features/financeRecords/components/searchFilters/AppliedTagsFilter.vue'
import AppliedTypeFilter from '@features/financeRecords/components/searchFilters/AppliedTypeFilter.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  useFinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

const mountComponent = getMountComponent(AppliedSearchFilters, {
  global: {
    provide: {
      [FINANCE_RECORD_SEARCH_FILTERS_SYMBOL]: useFinanceRecordSearchFiltersProvider(),
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
