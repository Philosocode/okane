// Internal
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

const mountComponent = getMountComponent(ModalHeading)

test('renders an h3 containing the passed content', () => {
  const text = 'Hello world'
  const wrapper = mountComponent({
    slots: {
      default: text,
    },
  })

  const heading = wrapper.find('h3')
  expect(heading.text()).toBe(text)
})
