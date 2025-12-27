// Internal
import AppliedSorting, {
  type AppliedSortingProps,
} from '@features/financeRecords/components/searchFilters/AppliedSorting.vue'

import { FINANCES_SEARCH_FILTERS_COPY } from '@features/financeRecords/constants/searchFiltersCopy'
import { SORT_DIRECTION } from '@shared/constants/search'

const mountComponent = getMountComponent(AppliedSorting)

test('renders the sort field and direction', () => {
  const props: AppliedSortingProps = {
    sortDirection: SORT_DIRECTION.ASCENDING,
    sortField: 'amount',
  }
  const wrapper = mountComponent({ props })
  const lis = wrapper.findAllByText(
    'li',
    FINANCES_SEARCH_FILTERS_COPY.APPLIED_SORTING({
      sortDirection: props.sortDirection,
      sortField: props.sortField,
    }),
  )
  expect(lis).toHaveLength(1)
})
