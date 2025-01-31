// Internal
import AppliedSorting, {
  type AppliedSortingProps,
} from '@features/financeRecords/components/searchFinanceRecords/AppliedSorting.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
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
    FINANCES_COPY.SEARCH_FILTERS.APPLIED_SORTING({
      sortDirection: props.sortDirection,
      sortField: props.sortField,
    }),
  )
  expect(lis).toHaveLength(1)
})
