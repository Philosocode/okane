// Internal
import ModalActions from '@shared/components/modal/ModalActions.vue'

const mountComponent = getMountComponent(ModalActions)

test('renders a div with the passed content', () => {
  const wrapper = mountComponent({
    slots: {
      default: '<h1>Hello world</h1>',
    },
  })

  expect(wrapper.find('.root').exists()).toBe(true)
  expect(wrapper.get('h1').text()).toBe('Hello world')
})
