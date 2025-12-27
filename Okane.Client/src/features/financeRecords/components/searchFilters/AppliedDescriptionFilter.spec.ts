// Internal
import AppliedDescriptionFilter, {
  type AppliedDescriptionFilterProps,
} from '@features/financeRecords/components/searchFilters/AppliedDescriptionFilter.vue'

import { FINANCES_SEARCH_FILTERS_COPY } from '@features/financeRecords/constants/searchFiltersCopy'

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
    FINANCES_SEARCH_FILTERS_COPY.APPLIED_DESCRIPTION({ description: props.description }),
  )
  expect(lis).toHaveLength(1)
})
