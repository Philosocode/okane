// Internal
import FormLabel from '@shared/components/form/FormLabel.vue'

const mountComponent = getMountComponent(FormLabel)

test('renders a label with the expected attributes & content', () => {
  const id = 'cool-id'
  const text = 'Test'
  const wrapper = mountComponent({
    props: { id },
    slots: {
      default: text,
    },
  })

  const label = wrapper.get('label')
  expect(label.attributes('id')).toBe(id)
  expect(label.text()).toBe(text)
})
