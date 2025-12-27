// Internal
import ToggleableRangeInputs from '@shared/components/form/ToggleableRangeInputs.vue'
import FinanceRecordHappenedAtFilter, {
  type FinanceRecordHappenedAtFilterProps,
} from '@features/financeRecords/components/searchFilters/FinanceRecordHappenedAtFilter.vue'

import { COMPARISON_OPERATOR } from '@shared/constants/search'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'

import { mapDate } from '@shared/utils/dateTime'
import { HAPPENED_AT_TIMEFRAME } from '@features/financeRecords/constants/searchFilters'

const mountComponent = getMountComponent(FinanceRecordHappenedAtFilter)

describe(`when timeframe is not ${HAPPENED_AT_TIMEFRAME.CUSTOM}`, () => {
  const props: FinanceRecordHappenedAtFilterProps = {
    happenedAt1: mapDate.to.dateOnlyTimestamp(new Date('2024-01-01')),
    happenedAt2: '',
    happenedAtOperator: '',
    happenedAtTimeframe: HAPPENED_AT_TIMEFRAME.THIS_MONTH,
  }

  test('renders a "happened at" label', () => {
    const wrapper = mountComponent({ props })
    const legend = wrapper.findByText('label', FINANCES_COPY.PROPERTIES.HAPPENED_AT)
    expect(legend).toBeDefined()
  })

  test('renders a timeframe select', () => {
    const wrapper = mountComponent({ props })
    const select = wrapper.find('select')
    expect(select).toBeDefined()
  })

  test('emits a "change" event when the timeframe changes', async () => {
    const wrapper = mountComponent({ props })
    const select = wrapper.find('select')
    await select.setValue(HAPPENED_AT_TIMEFRAME.PAST_30_DAYS)

    expect(wrapper.emitted('change')).toEqual([
      [expect.objectContaining({ happenedAtTimeframe: HAPPENED_AT_TIMEFRAME.PAST_30_DAYS })],
    ])
  })

  test('does not render ToggleableRangeInputs', () => {
    const wrapper = mountComponent({ props })
    const inputs = wrapper.findComponent(ToggleableRangeInputs)
    expect(inputs.exists()).toBe(false)
  })
})

describe(`when timeframe is ${HAPPENED_AT_TIMEFRAME.CUSTOM}`, () => {
  const props: FinanceRecordHappenedAtFilterProps = {
    happenedAt1: mapDate.to.dateOnlyTimestamp(new Date('2024-01-01')),
    happenedAt2: mapDate.to.dateOnlyTimestamp(new Date('2024-01-02')),
    happenedAtOperator: '',
    happenedAtTimeframe: HAPPENED_AT_TIMEFRAME.CUSTOM,
  }

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
    expect((input.element as HTMLInputElement).value).toBe(props.happenedAt1)

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
    expect(wrapper.emitted('change')).toEqual([[{ happenedAt1: timestamp }]])
  })

  test('renders a happenedAt2 input', () => {
    const wrapper = mountComponent({ props })
    const input = wrapper.find('input[name="happenedAt2"]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('required')).toBeDefined()
    expect(input.attributes('type')).toBe(INPUT_TYPE.DATE)
    expect((input.element as HTMLInputElement).value).toBe(props.happenedAt2)

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
    expect(wrapper.emitted('change')).toEqual([[{ happenedAt2: timestamp }]])
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
})
