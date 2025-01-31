// Internal
import Card from '@shared/components/wrappers/Card.vue'

const mountComponent = getMountComponent(Card)

test('renders an element with the provided attributes & content', () => {
  const id = 'cool-id'
  const text = 'Test'
  const wrapper = mountComponent({
    props: { id },
    slots: {
      default: text,
    },
  })

  const card = wrapper.get(`#${id}`)
  expect(card).toBeDefined()
  expect(card.text()).toBe(text)
})
