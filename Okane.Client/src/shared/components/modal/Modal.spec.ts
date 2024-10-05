// Internal
import Modal from '@shared/components/modal/Modal.vue'

import { ARIA_ATTRIBUTES } from '@shared/constants/aria'
import { DATA_ATTRIBUTES } from '@shared/constants/dataAttributes'
import { SHARED_COPY } from '@shared/constants/copy'

const props = {
  isShowing: true,
  modalHeadingId: 'cool-heading-id',
}

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
  const wrapper = mountComponent({ props })
  const dialog = wrapper.get('dialog')
  expect(dialog.attributes(ARIA_ATTRIBUTES.MODAL)).toBe('true')
  expect(dialog.attributes(ARIA_ATTRIBUTES.LABELLED_BY)).toBe(props.modalHeadingId)
  expect(dialog.attributes(DATA_ATTRIBUTES.DISABLE_DOCUMENT_SCROLL)).toBe('true')
})

test('does not render the modal content when the modal is hidden', () => {
  const wrapper = mountComponent({
    props: { ...props, isShowing: false },
  })

  const dialog = wrapper.get('dialog')
  expect(dialog.attributes(DATA_ATTRIBUTES.DISABLE_DOCUMENT_SCROLL)).toBe('false')

  const button = wrapper.find('button')
  expect(button.exists()).toBe(false)
})

test('renders a close button that closes the modal', async () => {
  const wrapper = mountComponent({ props })
  const closeButton = wrapper.get('button')
  const title = closeButton.get('title')
  expect(title.text()).toBe(SHARED_COPY.MODAL.CLOSE_MODAL)

  await closeButton.trigger('click')
  expect(wrapper.emitted()).toHaveProperty('close')
})

test('renders the slot content', () => {
  const wrapper = mountComponent({
    props,
    slots: { default: '<h1>Hello world</h1>' },
  })

  const modal = wrapper.getComponent(Modal)
  expect(modal.get('h1').text()).toBe('Hello world')
})

test('passes extra attributes', () => {
  const id = 'dialogId'
  const wrapper = mountComponent({
    props: { ...props, id },
  })
  const dialog = wrapper.find(`#${id}`)
  expect(dialog.exists()).toBe(true)
})
