// Internal
import ToggleableRangeInputs from '@shared/components/form/ToggleableRangeInputs.vue'
import FinanceRecordHappenedAtFilter, {
  type FinanceRecordHappenedAtFilterProps,
} from '@features/financeRecords/components/FinanceRecordHappenedAtFilter.vue'

import { COMPARISON_OPERATOR } from '@shared/constants/search'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'

import { mapDate, mapUTCTimestampToLocalDate } from '@shared/utils/dateTime'

const mountComponent = getMountComponent(FinanceRecordHappenedAtFilter)
const props: FinanceRecordHappenedAtFilterProps = {
  happenedAt1: new Date('2024-01-01'),
  happenedAt2: new Date('2024-01-02'),
}

test('renders a "happened at" legend', () => {
  const wrapper = mountComponent({ props })
  const legend = wrapper.findByText('legend', FINANCES_COPY.PROPERTIES.HAPPENED_AT)
  expect(legend).toBeDefined()
})

test('emits a "change" event with operator when the operator changes', () => {
  const wrapper = mountComponent({ props })
  const toggleableRangeInputs = wrapper.findComponent(ToggleableRangeInputs)

  toggleableRangeInputs.vm.$emit('operatorChange', COMPARISON_OPERATOR.EQUAL)

  expect(wrapper.emitted('change')).toEqual([[{ happenedAtOperator: COMPARISON_OPERATOR.EQUAL }]])
})

test('renders a required happenedAt1 input', () => {
  const wrapper = mountComponent({ props })
  const input = wrapper.get('input[name="happenedAt1"]')
  expect(input.attributes('required')).toBeDefined()
  expect(input.attributes('type')).toBe(INPUT_TYPE.DATE)
  expect((input.element as HTMLInputElement).value).toBe(
    mapDate.to.dateOnlyTimestamp(props.happenedAt1!),
  )

  const label = wrapper.findByText(
    'label',
    FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.HAPPENED_AFTER,
  )
  expect(label).toBeDefined()
})

test('emits a "change" event when the happenedAt1 input value is updated', async () => {
  const wrapper = mountComponent({ props })
  const input = wrapper.get('input[name="happenedAt1"]')
  const timestamp = '2024-01-31'
  await input.setValue(timestamp)
  expect(wrapper.emitted('change')).toEqual([
    [{ happenedAt1: mapUTCTimestampToLocalDate(timestamp) }],
  ])
})

test('renders a happenedAt2 input', () => {
  const wrapper = mountComponent({ props })
  const input = wrapper.find('input[name="happenedAt2"]')
  expect(input.exists()).toBe(true)
  expect(input.attributes('required')).toBeDefined()
  expect(input.attributes('type')).toBe(INPUT_TYPE.DATE)
  expect((input.element as HTMLInputElement).value).toBe(
    mapDate.to.dateOnlyTimestamp(props.happenedAt2!),
  )

  const label = wrapper.findByText(
    'label',
    FINANCES_COPY.SEARCH_FINANCE_RECORDS_MODAL.HAPPENED_BEFORE,
  )
  expect(label).toBeDefined()
})

test('emits a "change" event when the happenedAt2 input value is updated', async () => {
  const wrapper = mountComponent({ props })
  const input = wrapper.get('input[name="happenedAt2"]')
  const timestamp = '2024-01-31'
  await input.setValue(timestamp)
  expect(wrapper.emitted('change')).toEqual([
    [{ happenedAt2: mapUTCTimestampToLocalDate(timestamp) }],
  ])
})

describe('when an operator is provided', () => {
  const propsWithOperator = { ...props, happenedAtOperator: COMPARISON_OPERATOR.GTE }

  test('renders an operator select with the expected name', () => {
    const wrapper = mountComponent({ props: propsWithOperator })
    const select = wrapper.find(`select[name='happenedAtOperator']`)
    expect(select.exists()).toBe(true)
  })

  test('renders an optional happenedAt1 input', () => {
    const wrapper = mountComponent({ props: propsWithOperator })
    const amount1Input = wrapper.get('input[name="happenedAt1"]')
    expect(amount1Input.attributes('required')).toBeUndefined()
  })

  test('renders the appropriate happenedAt1 input label', () => {
    const wrapper = mountComponent({ props: propsWithOperator })
    const label = wrapper.findByText('label', FINANCES_COPY.PROPERTIES.HAPPENED_AT)
    expect(label).toBeDefined()
  })

  test('does not render the happenedAt2 input', () => {
    const wrapper = mountComponent({ props: propsWithOperator })
    const input = wrapper.find('input[name="happenedAt2"]')
    expect(input.exists()).toBe(false)
  })
})
