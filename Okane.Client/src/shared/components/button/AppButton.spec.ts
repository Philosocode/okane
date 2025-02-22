// External
import AppButton from '@shared/components/button/AppButton.vue'

import { defineComponent, useTemplateRef, watchEffect } from 'vue'
import { flushPromises } from '@vue/test-utils'

const mountComponent = getMountComponent(AppButton)

test('renders a button with the passed attributes', () => {
  const id = 'cool-button'
  const text = 'Cool button'

  const wrapper = mountComponent({
    props: { id },
    slots: {
      default: text,
    },
  })

  const button = wrapper.get(`button#${id}`)
  expect(button.text()).toBe(text)
})

test('does not disable the button when disabled is falsy', () => {
  const wrapper = mountComponent()
  const button = wrapper.get('button')
  expect(button.attributes('disabled')).toBeUndefined()
})

test('disables the button when disabled is true', () => {
  const wrapper = mountComponent({
    props: {
      disabled: true,
    },
  })
  const button = wrapper.get('button')
  expect(button.attributes('disabled')).toBeDefined()
})

test('does not focus the button when focusOnMount is falsy', () => {
  const wrapper = mountComponent({ attachTo: document.body })
  const button = wrapper.get('button')
  expect(document.activeElement).not.toBe(button.element)
})

test('focuses the button when focusOnMount is true', () => {
  const wrapper = mountComponent({
    attachTo: document.body,
    props: { focusOnMount: true },
  })
  const button = wrapper.get('button')
  expect(document.activeElement).toBe(button.element)
})

test('exposes a buttonRef', async () => {
  const TestComponent = defineComponent({
    components: { AppButton },
    setup() {
      const buttonRef = useTemplateRef<InstanceType<typeof AppButton>>('buttonRef')

      watchEffect(() => {
        buttonRef.value?.buttonRef?.focus()
      })

      return { buttonRef }
    },
    template: `<AppButton ref="buttonRef" />`,
  })

  const wrapper = getMountComponent(TestComponent)({
    attachTo: document.body,
  })
  const button = wrapper.get('button')
  await flushPromises()
  expect(button.element).toEqual(document.activeElement)
})

test('does not display a shadow when withShadow is false', () => {
  const wrapper = mountComponent({
    props: { withShadow: false },
  })
  const button = wrapper.get('button')
  expect(button.classes()).not.toContain('with-shadow')
})

test('does not display a shadow when withShadow is true', () => {
  const wrapper = mountComponent({
    props: { withShadow: true },
  })
  const button = wrapper.get('button')
  expect(button.classes()).toContain('with-shadow')
})
