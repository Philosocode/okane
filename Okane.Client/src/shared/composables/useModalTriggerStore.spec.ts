// External
import { defineComponent, useTemplateRef } from 'vue'

// Internal
import { useModalTriggerStore } from '@shared/composables/useModalTriggerStore'

const TestComponent = defineComponent({
  setup() {
    const buttonRef = useTemplateRef<HTMLButtonElement>('buttonRef')
    const store = useModalTriggerStore()

    function toggle() {
      if (store.modalTrigger) {
        store.setModalTrigger(null)
      } else {
        store.setModalTrigger(buttonRef.value)
      }
    }

    return { buttonRef, store, toggle }
  },
  template: '<button ref="buttonRef" @click="toggle" />',
})

const mountComponent = getMountComponent(TestComponent, { withPinia: true })

test('updates the modal trigger', async () => {
  const store = useModalTriggerStore()
  const wrapper = mountComponent()
  const button = wrapper.get('button')
  await button.trigger('click')
  expect(store.modalTrigger).toEqual(button.element)
  await wrapper.get('button').trigger('click')
  expect(store.modalTrigger).toBeNull()
})
