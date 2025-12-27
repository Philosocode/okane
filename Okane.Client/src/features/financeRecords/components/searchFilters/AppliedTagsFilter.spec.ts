// Internal
import AppliedTagsFilter, {
  type AppliedTagsFilterProps,
} from '@features/financeRecords/components/searchFilters/AppliedTagsFilter.vue'

import { FINANCES_SEARCH_FILTERS_COPY } from '@features/financeRecords/constants/searchFiltersCopy'

import { createTestTag } from '@tests/factories/tag'

const mountComponent = getMountComponent(AppliedTagsFilter)

test('renders nothing if not filtering by tags', () => {
  const props: AppliedTagsFilterProps = { tags: [] }
  const wrapper = mountComponent({ props })
  expect(wrapper.find('li').exists()).toBe(false)
})

test('renders the tags', () => {
  const tags = [createTestTag()]
  const props: AppliedTagsFilterProps = { tags }
  const wrapper = mountComponent({ props })
  const lis = wrapper.findAllByText('li', FINANCES_SEARCH_FILTERS_COPY.APPLIED_TAGS({ tags }))
  expect(lis).toHaveLength(1)
})
