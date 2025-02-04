// Internal
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'

const mountComponent = getMountComponent(ErrorMessage)

test('renders with the provided attributes and content', () => {
  const id = 'cool-error'
  const text = 'Error'
  const wrapper = mountComponent({
    props: { id },
    slots: {
      default: text,
    },
  })

  const error = wrapper.getComponent(ErrorMessage)
  expect(error.text()).toBe(text)
  expect(error.attributes('id')).toBe(id)
})
