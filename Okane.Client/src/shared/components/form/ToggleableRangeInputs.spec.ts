// Internal
import FormSelect from '@shared/components/form/FormSelect.vue'
import RangeInputs from '@shared/components/form/ToggleableRangeInputs.vue'

import { ALL_COMPARISON_OPERATOR_OPTIONS, COMPARISON_OPERATOR } from '@shared/constants/search'
import { SHARED_COPY } from '@shared/constants/copy'

const props = {
  isShowingRange: false,
  label: 'Test Label',
  operator: COMPARISON_OPERATOR.GTE,
}

const testIds = {
  input1: 'input1',
  input2: 'input2',
}

const mountComponent = getMountComponent(RangeInputs, {
  slots: {
    input1: `<input data-testid="${testIds.input1}" />`,
    input2: `<input data-testid="${testIds.input2}" />`,
  },
})

test('renders a legend containing the label', () => {
  const wrapper = mountComponent({ props })
  const legend = wrapper.findByText('legend', props.label)
  expect(legend).toBeDefined()
})

test('renders a select dropdown to select an operator', () => {
  const wrapper = mountComponent({ props })
  const select = wrapper.getComponent(FormSelect)
  const options = select.findAll('option')
  const optionSet = new Set<string>()
  options.forEach((option) => {
    const operator = option.attributes('value')
    expect(operator).toBeDefined()
    optionSet.add(operator!)
  })

  ALL_COMPARISON_OPERATOR_OPTIONS.forEach((option) => {
    expect(optionSet.has(option.value)).toBe(true)
  })
})

test('emits an "operatorChange" event when selecting an operator', async () => {
  const wrapper = mountComponent({ props })
  const select = wrapper.getComponent(FormSelect)
  await select.setValue(COMPARISON_OPERATOR.LTE)
  expect(wrapper.emitted('operatorChange')?.[0][0]).toEqual(COMPARISON_OPERATOR.LTE)
})

test('does not render the second input when isShowingRange is false', () => {
  const wrapper = mountComponent({ props })

  const and = wrapper.findByText('p', SHARED_COPY.CONJUNCTIONS.AND)
  expect(and).toBeUndefined()

  const secondInput = wrapper.find(`[data-testid='${testIds.input2}']`)
  expect(secondInput.exists()).toBe(false)
})

test('clicking the toggle button switches to multiple inputs', async () => {
  const wrapper = mountComponent({ props })
  const toggleButton = wrapper.findByText('button', SHARED_COPY.SEARCH.USE_RANGE)
  await toggleButton.trigger('click')
  expect(wrapper.emitted('operatorChange')?.[0][0]).toBe(undefined)
})

describe('when showing a range', () => {
  const propsWithRange = {
    ...props,
    isShowingRange: true,
  }

  test('renders the second input', () => {
    const wrapper = mountComponent({ props: propsWithRange })

    const and = wrapper.findByText('p', SHARED_COPY.CONJUNCTIONS.AND)
    expect(and).toBeDefined()

    const secondInput = wrapper.find(`[data-testid='${testIds.input2}']`)
    expect(secondInput.exists()).toBe(true)
  })

  test('does not render a dropdown to select an operator', async () => {
    const wrapper = mountComponent({ props: propsWithRange })
    const formSelect = wrapper.findComponent(FormSelect)
    expect(formSelect.exists()).toBe(false)
  })

  test('clicking the toggle button switches to a single input', async () => {
    const wrapper = mountComponent({ props: propsWithRange })
    const toggleButton = wrapper.findByText('button', SHARED_COPY.SEARCH.USE_SINGLE)
    await toggleButton.trigger('click')
    expect(wrapper.emitted('operatorChange')?.[0][0]).toBe(COMPARISON_OPERATOR.GTE)
  })
})
