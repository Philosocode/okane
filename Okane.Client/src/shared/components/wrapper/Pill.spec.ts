// Internal
import Pill from '@shared/components/wrapper/Pill.vue'

const mountComponent = getMountComponent(Pill)

test('renders the attributes and content', () => {
  const id = 'cool-kicker'
  const text = 'Test'
  const wrapper = mountComponent({
    props: { id },
    slots: {
      default: text,
    },
  })

  const pill = wrapper.get('div')
  expect(pill.text()).toBe(text)
  expect(pill.attributes('id')).toBe(id)
})
