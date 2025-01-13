// Internal
import TagPill from '@shared/components/TagPill.vue'

const mountComponent = getMountComponent(TagPill)

const tagName = 'Cool Tag'

test('renders the tag name', () => {
  const wrapper = mountComponent({ props: { tagName } })
  expect(wrapper.findByText('div', tagName)).toBeDefined()
})
