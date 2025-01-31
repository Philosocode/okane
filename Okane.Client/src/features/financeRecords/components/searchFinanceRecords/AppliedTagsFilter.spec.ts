// Internal
import AppliedTagsFilter, {
  type AppliedTagsFilterProps,
} from '@features/financeRecords/components/searchFinanceRecords/AppliedTagsFilter.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

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
  const lis = wrapper.findAllByText('li', FINANCES_COPY.SEARCH_FILTERS.APPLIED_TAGS({ tags }))
  expect(lis).toHaveLength(1)
})
