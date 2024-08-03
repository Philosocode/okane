// Internal
import Modal from '@shared/components/modal/Modal.vue'

const isShowingProps = { isShowing: true }

const mountComponent = getMountComponent(Modal, {
  global: {
    stubs: {
      teleport: true,
    },
  },
})

// TODO: Expand on these tests.
// These tests are a bit bare-bones because, at the moment, jsdom doesn't properly support
// HTMLDialogElement (e.g. show, showModal, close). See: https://github.com/jsdom/jsdom/issues/3294
test('renders a dialog', () => {
  const wrapper = mountComponent({
    props: isShowingProps,
  })

  expect(wrapper.find('dialog').exists()).toBe(true)
})

test('renders a close button that closes the modal', async () => {
  const wrapper = mountComponent({
    props: isShowingProps,
  })

  const closeButton = wrapper.get('button')
  expect(closeButton.text()).toBe('')

  await closeButton.trigger('click')
  expect(wrapper.emitted()).toHaveProperty('close')
})

test('renders the slot content', () => {
  const wrapper = mountComponent({
    props: isShowingProps,
    slots: { default: '<h1>Hello world</h1>' },
  })

  const modal = wrapper.getComponent(Modal)
  expect(modal.get('h1').text()).toBe('Hello world')
})
