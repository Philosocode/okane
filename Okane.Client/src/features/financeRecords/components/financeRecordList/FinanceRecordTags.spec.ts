// Internal
import Pill from '@shared/components/wrapper/Pill.vue'
import FinanceRecordTags, {
  type FinanceRecordTagsProps,
} from '@features/financeRecords/components/financeRecordList/FinanceRecordTags.vue'

import { createTestTag } from '@tests/factories/tag'

const mountComponent = getMountComponent(FinanceRecordTags)

const defaultProps: FinanceRecordTagsProps = {
  tags: [createTestTag({ name: 'Tag 1' }), createTestTag({ id: 2, name: 'Tag 2' })],
}

test('renders a pill for each tag', () => {
  const wrapper = mountComponent({ props: defaultProps })
  const pills = wrapper.findAllComponents(Pill)
  defaultProps.tags.forEach((tag) => {
    const hasMatchingPill = pills.some((pill) => pill.text() === tag.name)
    expect(hasMatchingPill).toBe(true)
  })
})
