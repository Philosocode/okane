// Internal
import Kicker, { type KickerProps } from '@shared/components/typography/Kicker.vue'

const props: KickerProps = {
  tag: 'h1',
}

const mountComponent = getMountComponent(Kicker, { props })

test('renders with the provided attributes and content', () => {
  const id = 'cool-kicker'
  const text = 'Test'
  const wrapper = mountComponent({
    props: { id },
    slots: {
      default: text,
    },
  })

  const kicker = wrapper.get(props.tag!)
  expect(kicker.text()).toBe(text)
  expect(kicker.attributes('id')).toBe(id)
})
