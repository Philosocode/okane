// Internal
import AppliedDescriptionFilter, {
  type AppliedDescriptionFilterProps,
} from '@features/financeRecords/components/searchFilters/AppliedDescriptionFilter.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

const mountComponent = getMountComponent(AppliedDescriptionFilter)

test('renders nothing if not filtering by description', () => {
  const props: AppliedDescriptionFilterProps = { description: '' }
  const wrapper = mountComponent({ props })
  expect(wrapper.find('li').exists()).toBe(false)
})

test('renders the description', () => {
  const props: AppliedDescriptionFilterProps = { description: 'Cool description' }
  const wrapper = mountComponent({ props })
  const lis = wrapper.findAllByText(
    'li',
    FINANCES_COPY.SEARCH_FILTERS.APPLIED_DESCRIPTION({ description: props.description }),
  )
  expect(lis).toHaveLength(1)
})
