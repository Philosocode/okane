// Internal
import ToggleableRangeInputs from '@shared/components/form/ToggleableRangeInputs.vue'
import FinanceRecordAmountFilter, {
  type FinanceRecordAmountFilterProps,
} from '@features/financeRecords/components/FinanceRecordAmountFilter.vue'

import { COMPARISON_OPERATOR } from '@shared/constants/search'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { FINANCE_RECORD_MIN_AMOUNT } from '@features/financeRecords/constants/saveFinanceRecord'

const mountComponent = getMountComponent(FinanceRecordAmountFilter)
const props: FinanceRecordAmountFilterProps = {
  amount1: 10,
  amount2: 20,
}

test('renders an "amount" legend', () => {
  const wrapper = mountComponent({ props })
  const legend = wrapper.findByText('legend', FINANCES_COPY.PROPERTIES.AMOUNT)
  expect(legend).toBeDefined()
})

test('emits a "change" event with operator when the operator changes', () => {
  const wrapper = mountComponent({ props })
  const toggleableRangeInputs = wrapper.findComponent(ToggleableRangeInputs)

  toggleableRangeInputs.vm.$emit('operatorChange', COMPARISON_OPERATOR.EQUAL)

  expect(wrapper.emitted('change')).toEqual([[{ amountOperator: COMPARISON_OPERATOR.EQUAL }]])
})

test('renders a required amount1 input', () => {
  const wrapper = mountComponent({ props })
  const input = wrapper.get('input[name="amount1"]')
  expect(input.attributes('required')).toBeDefined()
  expect(input.attributes('step')).toBe(FINANCE_RECORD_MIN_AMOUNT.toString())
  expect((input.element as HTMLInputElement).value).toEqual(props.amount1?.toString())

  const label = wrapper.findByText('label', FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.MIN_AMOUNT)
  expect(label).toBeDefined()
})

test('emits a "change" event when the amount1 input value is updated', () => {
  const wrapper = mountComponent({ props })
  const amount1Input = wrapper.get('input[name="amount1"]')
  amount1Input.setValue(100)
  expect(wrapper.emitted('change')).toEqual([[{ amount1: 100 }]])
})

test('renders an amount2 input', () => {
  const wrapper = mountComponent({ props })
  const input = wrapper.find('input[name="amount2"]')
  expect(input.exists()).toBe(true)
  expect(input.attributes('step')).toBe(FINANCE_RECORD_MIN_AMOUNT.toString())
  expect((input.element as HTMLInputElement).value).toEqual(props.amount2?.toString())

  const label = wrapper.findByText('label', FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.MAX_AMOUNT)
  expect(label).toBeDefined()
})

test('emits a "change" event when the amount2 input value is updated', () => {
  const wrapper = mountComponent({ props })
  const input = wrapper.get('input[name="amount2"]')
  input.setValue(100)
  expect(wrapper.emitted('change')).toEqual([[{ amount2: 100 }]])
})

describe('when an operator is provided', () => {
  const propsWithOperator = { ...props, amountOperator: COMPARISON_OPERATOR.GTE }

  test('renders an operator select with the expected name', () => {
    const wrapper = mountComponent({ props: propsWithOperator })
    const select = wrapper.find(`select[name='amountOperator']`)
    expect(select.exists()).toBe(true)
  })

  test('renders an optional amount1 input', () => {
    const wrapper = mountComponent({ props: propsWithOperator })
    const input = wrapper.get('input[name="amount1"]')
    expect(input.attributes('required')).toBeUndefined()
  })

  test('renders the appropriate amount1 input label', () => {
    const wrapper = mountComponent({ props: propsWithOperator })
    const label = wrapper.findByText('label', FINANCES_COPY.PROPERTIES.AMOUNT)
    expect(label).toBeDefined()
  })

  test('does not render the amount2 input', () => {
    const wrapper = mountComponent({ props: propsWithOperator })
    const input = wrapper.find('input[name="amount2"]')
    expect(input.exists()).toBe(false)
  })
})
