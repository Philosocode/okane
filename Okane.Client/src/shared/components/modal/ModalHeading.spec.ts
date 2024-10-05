// Internal
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

const mountComponent = getMountComponent(ModalHeading)

test('renders a specific heading type containing the passed content', () => {
  const text = 'Hello world'
  const wrapper = mountComponent({
    slots: {
      default: text,
    },
  })

  const heading = wrapper.find('h3')
  expect(heading.text()).toBe(text)
})

test('passes extra attributes', () => {
  const testId = 'coolTestId'
  const wrapper = mountComponent({
    props: { 'data-testid': testId },
  })
  const heading = wrapper.find('h3')
  expect(heading.attributes('data-testid')).toBe(testId)
})
