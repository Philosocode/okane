// External
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { flushPromises } from '@vue/test-utils'
import { defineComponent, useTemplateRef, watchEffect } from 'vue'

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

test('exposes a buttonRef', async () => {
  const TestComponent = defineComponent({
    components: { IconButton },
    setup() {
      const buttonRef = useTemplateRef<InstanceType<typeof IconButton>>('buttonRef')

      watchEffect(() => {
        buttonRef.value?.buttonRef?.focus()
      })

      return { buttonRef }
    },
    template: `<IconButton icon="fa-solid fa-sun" ref="buttonRef" title="Test" />`,
  })

  const wrapper = getMountComponent(TestComponent)({
    attachTo: document.body,
  })
  const button = wrapper.get('button')
  await flushPromises()
  expect(button.element).toEqual(document.activeElement)
})
