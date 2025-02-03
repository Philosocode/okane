// External
import { type VueWrapper } from '@vue/test-utils'

// Internal
import ModalTrigger from '@shared/components/modal/ModalTrigger.vue'

import {
  type ModalTriggerStore,
  useModalTriggerStore,
} from '@shared/composables/useModalTriggerStore'

const mountComponent = getMountComponent(ModalTrigger, { withPinia: true })

test('renders a button with the passed attributes and content', () => {
  const id = 'cool-trigger'
  const text = 'Cool trigger'
  const wrapper = mountComponent({
    props: { id },
    slots: {
      default: text,
    },
  })
  const button = wrapper.get('button')
  expect(button.attributes('id')).toBe(id)
  expect(button.text()).toBe(text)
})

test('renders an icon button', () => {
  const title = 'Test title'
  const wrapper = mountComponent({
    props: {
      icon: 'fa-solid fa-sun',
      isIcon: true,
      title,
    },
  })
  const titleElement = wrapper.get('title')
  expect(titleElement.text()).toBe(title)
})

describe('on click', () => {
  let triggerStore: ModalTriggerStore
  let wrapper: VueWrapper

  beforeEach(async () => {
    triggerStore = useModalTriggerStore()
    wrapper = mountComponent()

    const trigger = wrapper.get('button')
    await trigger.trigger('click')
  })

  test('updates the store state', () => {
    const button = wrapper.get('button')
    expect(triggerStore.modalTrigger).toEqual(button.element)
  })

  test('emits a click event', () => {
    expect(wrapper.emitted('click')).toBeDefined()
  })
})
