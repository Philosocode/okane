// Internal
import Kicker from '@shared/components/typography/Kicker.vue'
import Pill from '@shared/components/Pill.vue'
import FinanceRecordListItemTags, {
  type FinanceRecordListItemTagsProps,
} from '@features/financeRecords/components/financeRecordList/FinanceRecordListItemTags.vue'

import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { HTML_ROLE } from '@shared/constants/html'

import { createTestTag } from '@tests/factories/tag'

const mountComponent = getMountComponent(FinanceRecordListItemTags)

const defaultProps: FinanceRecordListItemTagsProps = {
  tags: [createTestTag({ name: 'Tag 1' }), createTestTag({ id: 2, name: 'Tag 2' })],
  type: FINANCE_RECORD_TYPE.REVENUE,
}

test('renders the type', () => {
  const wrapper = mountComponent({ props: defaultProps })
  const type = wrapper.getComponent(Kicker)
  expect(type.text()).toBe(defaultProps.type)
})

test('renders a pill for each tag', () => {
  const wrapper = mountComponent({ props: defaultProps })
  const pills = wrapper.findAllComponents(Pill)
  defaultProps.tags.forEach((tag) => {
    const hasMatchingPill = pills.some((pill) => pill.text() === tag.name)
    expect(hasMatchingPill).toBe(true)
  })
})

test('does not render a divider or pills when there are no tags', () => {
  const wrapper = mountComponent({
    props: {
      ...defaultProps,
      tags: [],
    },
  })
  expect(wrapper.find(`[aria-role="${HTML_ROLE.SEPARATOR}"]`).exists()).toBe(false)
  expect(wrapper.findAllComponents(Pill)).toHaveLength(1)
})
