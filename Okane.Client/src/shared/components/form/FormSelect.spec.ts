// External
import { expect } from 'vitest'

// Internal
import FormSelect, { type FormSelectProps } from '@shared/components/form/FormSelect.vue'

import { VISUALLY_HIDDEN_CLASS } from '@shared/constants/styles'

import * as formUtils from '@shared/utils/form'

import { commonAsserts } from '@tests/utils/commonAsserts'

const props: FormSelectProps = {
  label: 'Cool label',
  name: 'Cool select',
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

  const select = wrapper.get(`select[name='${props.name}']`)
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

  commonAsserts.rendersExpectedSelectOptions({
    expectedOptions: props.options,
    select: wrapper.get('select'),
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

test('renders a label with the expected properties', () => {
  const wrapper = mountComponent({ props })
  const label = wrapper.get('label')
  expect(label.text()).toBe(props.label)
  expect(label.attributes('for')).toBe(formControlId)
})

test('renders a visually-hidden label when withHiddenLabel is true', () => {
  const wrapper = mountComponent({
    props: { ...props, withHiddenLabel: true },
  })
  const label = wrapper.get('label')
  expect(label.classes()).toContain(VISUALLY_HIDDEN_CLASS)
})
