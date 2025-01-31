// External
import Button from '@shared/components/Button.vue'

const mountComponent = getMountComponent(Button)

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
