// Internal
import FormInput, { type FormInputProps } from '@shared/components/form/FormInput.vue'

import { INPUT_TYPE } from '@shared/constants/form'
import { VISUALLY_HIDDEN_CLASS } from '@shared/constants/styles'
import { ARIA_ATTRIBUTES, ARIA_LIVE } from '@shared/constants/aria'

import * as formUtils from '@shared/utils/form'

// Data.
const props: FormInputProps = {
  label: 'Cool Label',
  name: 'Cool Name',
  type: INPUT_TYPE.PASSWORD,
}

const formControlId = '1'

const mountComponent = getMountComponent(FormInput)

// Hooks.
beforeAll(() => {
  vitest.spyOn(formUtils, 'getUniqueFormControlId').mockReturnValue(formControlId)
})

afterAll(() => {
  vitest.spyOn(formUtils, 'getUniqueFormControlId').mockRestore()
})

// Tests.
test('renders a label with the expected text and attributes', () => {
  const wrapper = mountComponent({ props })

  const label = wrapper.get('label')
  expect(label.text()).toBe(props.label)
  expect(label.attributes('for')).toBe(formControlId)
})

test('renders a visually-hidden label when withHiddenLabel is true', () => {
  const wrapper = mountComponent({
    props: {
      ...props,
      withHiddenLabel: true,
    },
  })

  const label = wrapper.get('label')
  expect(label.classes()).toContain(VISUALLY_HIDDEN_CLASS)
})

test('renders an input with the expected attributes', () => {
  const testId = 'cool-test-id'
  const wrapper = mountComponent({
    attrs: { 'data-testid': testId },
    props,
  })

  const input = wrapper.get('input')
  expect(input.attributes()).toEqual(
    expect.objectContaining({
      'data-testid': testId,
      id: formControlId,
      name: props.name,
      type: props.type,
    }),
  )
})

test('does not focus the input by default', async () => {
  const wrapper = mountComponent({ attachTo: document.body, props })
  const input = wrapper.get('input')
  expect(input.element).not.toBe(document.activeElement)
})

test('focuses the input on mount when focusOnMount is true', async () => {
  const wrapper = mountComponent({
    attachTo: document.body,
    props: { ...props, focusOnMount: true },
  })
  const input = wrapper.get('input')
  expect(input.element).toBe(document.activeElement)
})

test('typing in the input updates its value', () => {
  const wrapper = mountComponent({ props })
  const input = wrapper.get('input')
  const text = 'hello world'
  input.setValue(text)
  expect(input.element.value).toBe(text)
})

test('does not render error text', () => {
  const wrapper = mountComponent({ props })
  expect(wrapper.find('.error').exists()).toBe(false)
})

describe('with an error', () => {
  const propsWithError = { ...props, error: 'Invalid input' }

  test('adds the expected aria attributes to the input', () => {
    const wrapper = mountComponent({
      props: propsWithError,
    })

    const input = wrapper.get('input')
    expect(input.attributes(ARIA_ATTRIBUTES.DESCRIBED_BY)).toBe(`${formControlId}-error`)
    expect(input.attributes(ARIA_ATTRIBUTES.INVALID)).toBe('true')
  })

  test('renders the error text', () => {
    const wrapper = mountComponent({
      props: propsWithError,
    })

    const error = wrapper.get('.error')
    expect(error.text()).toBe(propsWithError.error)
    expect(error.attributes(ARIA_ATTRIBUTES.LIVE)).toBe(ARIA_LIVE.ASSERTIVE)
    expect(error.attributes('id')).toBe(`${formControlId}-error`)
  })
})
