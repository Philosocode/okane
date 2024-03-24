// Internal
import FormInput, { type FormInputProps } from '@/shared/components/FormInput.vue'

import * as formUtils from '@/shared/utils/form.utils'
import { getMountComponent } from '@tests/utils/mount.utils'

// Data.
const props: FormInputProps = {
  label: 'Cool Label',
  name: 'Cool Name',
  type: 'password',
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
    expect(input.attributes('aria-describedby')).toBe(`${formControlId}-error`)
    expect(input.attributes('aria-invalid')).toBe('true')
  })

  test('renders the error text', () => {
    const wrapper = mountComponent({
      props: propsWithError,
    })

    const error = wrapper.get('.error')
    expect(error.text()).toBe(propsWithError.error)
    expect(error.attributes('aria-live')).toBe('assertive')
    expect(error.attributes('id')).toBe(`${formControlId}-error`)
  })
})
