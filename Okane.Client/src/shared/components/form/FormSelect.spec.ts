// External
import { expect } from 'vitest'

// Internal
import FormSelect, { type FormSelectProps } from '@shared/components/form/FormSelect.vue'

import * as formUtils from '@shared/utils/form.utils'

const props: FormSelectProps = {
  label: '',
  options: [
    { label: 'A', value: 'a' },
    { value: 'b' }, // For options without a label, the value should be displayed as a fallback.
  ],
}

const formControlId = '1'

const mountComponent = getMountComponent(FormSelect)

beforeAll(() => {
  vitest.spyOn(formUtils, 'getUniqueFormControlId').mockReturnValue(formControlId)
})

afterAll(() => {
  vitest.spyOn(formUtils, 'getUniqueFormControlId').mockRestore()
})

test('renders a select with the expected attributes', () => {
  const testId = 'cool-test-id'
  const wrapper = mountComponent({
    attrs: { 'data-testid': testId },
    props,
  })

  const select = wrapper.get('select')
  expect(select.attributes('data-testid')).toBe(testId)
  expect(select.attributes('id')).toBe(formControlId)
})

test('renders the options', () => {
  const selectedValue = props.options[1].value
  const wrapper = mountComponent({
    props: {
      ...props,
      modelValue: selectedValue,
    },
  })
  const options = wrapper.findAll('option')

  expect(options).toHaveLength(props.options.length)

  options.forEach((option, idx) => {
    const optionProp = props.options[idx]
    expect(option.attributes('value')).toBe(optionProp.value)

    const expectedText = optionProp.label ?? optionProp.value
    expect(option.text()).toBe(expectedText)

    let expectedSelectedValue = undefined
    if (optionProp.value === selectedValue) {
      expectedSelectedValue = ''
    }

    expect(option.attributes('selected')).toBe(expectedSelectedValue)
  })
})

test('updates the model value', async () => {
  const wrapper = mountComponent({
    props: {
      ...props,
      modelValue: props.options[0].value,
      'onUpdate:modelValue': (newValue: string) => wrapper.setProps({ modelValue: newValue }),
    },
  })

  const select = wrapper.find('select')
  await select.setValue(props.options[1].value)

  expect(wrapper.props('modelValue')).toBe(props.options[1].value)
})

test('does not render a label', () => {
  const wrapper = mountComponent({ props })
  expect(wrapper.find('label').exists()).toBe(false)
})

describe('with label text', () => {
  const propsWithLabel = { ...props, label: 'Cool label' }

  test('renders a label with the expected properties', () => {
    const wrapper = mountComponent({ props: propsWithLabel })
    const label = wrapper.get('label')
    expect(label.text()).toBe(propsWithLabel.label)
    expect(label.attributes('for')).toBe(formControlId)
  })
})
