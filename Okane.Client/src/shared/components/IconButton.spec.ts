// External
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Internal
import IconButton, { type IconButtonProps } from '@shared/components/IconButton.vue'

const mountComponent = getMountComponent(IconButton)

const props: IconButtonProps = {
  icon: 'fa-solid fa-trash',
  title: 'Not trash at all.',
}

test('renders a button', () => {
  const wrapper = mountComponent({ props })
  const button = wrapper.find('button')
  expect(button.exists()).toBe(true)
})

test('renders an icon', () => {
  const wrapper = mountComponent({ props })
  const icon = wrapper.getComponent(FontAwesomeIcon)
  const title = icon.findByText('title', props.title)
  expect(title).toBeDefined()
})
