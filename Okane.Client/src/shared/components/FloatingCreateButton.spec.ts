// Internal
import FloatingCreateButton from '@shared/components/FloatingCreateButton.vue'
import ModalTrigger from '@shared/components/modal/ModalTrigger.vue'

const title = 'Create something cool.'
const mountComponent = getMountComponent(FloatingCreateButton, { props: { title } })

test('renders a modal trigger with the passed title', () => {
  const wrapper = mountComponent()
  const button = wrapper.getComponent(ModalTrigger)
  expect(button.get('title').text()).toBe(title)
})

test('emits a "click" event on click', async () => {
  const wrapper = mountComponent()
  const button = wrapper.getComponent(ModalTrigger)
  await button.trigger('click')
  expect(wrapper.emitted('click')).toBeDefined()
})
