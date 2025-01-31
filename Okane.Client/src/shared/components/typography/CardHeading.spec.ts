// Internal
import CardHeading from '@shared/components/typography/CardHeading.vue'

const mountComponent = getMountComponent(CardHeading)

test('renders a heading with the provided attributes & text', () => {
  const id = 'cool-id'
  const text = 'Test'
  const wrapper = mountComponent({
    props: { id },
    slots: {
      default: text,
    },
  })

  const heading = wrapper.findByText('h3', text)
  expect(heading).toBeDefined()
  expect(heading.attributes('id')).toBe(id)
})
