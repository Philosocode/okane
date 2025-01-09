// Internal
import FloatingCreateButton from '@shared/components/FloatingCreateButton.vue'

const title = 'Create something cool.'
const mountComponent = getMountComponent(FloatingCreateButton, { props: { title } })

test('renders a button with the passed title', () => {
  const wrapper = mountComponent()
  const button = wrapper.get('button')
  expect(button.get('title').text()).toBe(title)
})

test('emits a "click" event on click', async () => {
  const wrapper = mountComponent()
  const button = wrapper.get('button')
  await button.trigger('click')
  expect(wrapper.emitted('click')).toBeDefined()
})
