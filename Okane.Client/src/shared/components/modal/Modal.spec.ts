// External
import { UseFocusTrap } from '@vueuse/integrations/useFocusTrap/component'

import { type VueWrapper } from '@vue/test-utils'

// Internal
import CardHeading from '@shared/components/typography/CardHeading.vue'
import Modal, { type ModalProps } from '@shared/components/modal/Modal.vue'

import { ARIA_ATTRIBUTES } from '@shared/constants/aria'
import { DATA_ATTRIBUTES } from '@shared/constants/dataAttributes'
import { SHARED_COPY } from '@shared/constants/copy'
import { TEST_IDS } from '@shared/constants/testIds'

const props: ModalProps = {
  headingText: 'Cool heading',
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

const elements = {
  backdrop(wrapper: VueWrapper) {
    return wrapper.find(`[data-testid="${TEST_IDS.MODAL_BACKDROP}"]`)
  },
  modal(wrapper: VueWrapper) {
    return wrapper.find(`[data-testid="${TEST_IDS.MODAL}"]`)
  },
}

test('renders a backdrop', () => {
  const wrapper = mountComponent({ props })
  expect(elements.backdrop(wrapper).exists()).toBe(true)
})

test('traps focus', () => {
  const wrapper = mountComponent({ props })
  expect(wrapper.findComponent(UseFocusTrap).exists()).toBe(true)
})

test('renders a modal', () => {
  const wrapper = mountComponent({ props })
  const modal = elements.modal(wrapper)
  expect(modal.attributes(ARIA_ATTRIBUTES.MODAL)).toBe('true')
  expect(modal.attributes(ARIA_ATTRIBUTES.LABELLED_BY)).toBe(props.modalHeadingId)
  expect(modal.attributes(DATA_ATTRIBUTES.DISABLE_DOCUMENT_SCROLL)).toBe('true')
})

test('does not render the modal or backdrop when the modal is hidden', () => {
  const wrapper = mountComponent({
    props: { ...props, isShowing: false },
  })

  const backdrop = elements.backdrop(wrapper)
  expect(backdrop.exists()).toBe(false)

  const modal = elements.modal(wrapper)
  expect(modal.exists()).toBe(false)
})

test('renders a heading', () => {
  const wrapper = mountComponent({ props })
  const heading = wrapper.getComponent(CardHeading)
  expect(heading.attributes('id')).toBe(props.modalHeadingId)
  expect(heading.text()).toBe(props.headingText)
})

test('renders a button to close the modal', async () => {
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
  const modal = wrapper.find(`#${id}`)
  expect(modal.exists()).toBe(true)
})

test('closes the modal when clicking the backdrop', async () => {
  const wrapper = mountComponent({
    attachTo: document.body,
    props,
  })
  const backdrop = elements.backdrop(wrapper)
  expect(wrapper.emitted('close')).toBeUndefined()
  await backdrop.trigger('click')
  expect(wrapper.emitted('close')).toBeDefined()
})
