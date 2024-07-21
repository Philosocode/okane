// Internal
import SaveFinanceRecordFormInputs from '@features/financeRecords/components/SaveFinanceRecordFormInputs.vue'

import { ARIA_LIVE } from '@shared/constants/aria.constants'
import { INPUT_TYPE } from '@shared/constants/form.constants'
import {
  FINANCE_RECORD_MAX_AMOUNT,
  FINANCE_RECORD_MIN_AMOUNT,
  FINANCE_RECORD_TYPE_OPTIONS,
} from '@features/financeRecords/constants/financeRecord.constants'

import { createStubSaveFinanceRecordFormState } from '@tests/factories/financeRecord.factory'
import { getInitialFormErrors } from '@shared/utils/form.utils'

const mountComponent = getMountComponent(SaveFinanceRecordFormInputs)

const formState = createStubSaveFinanceRecordFormState()
const formErrors = getInitialFormErrors(formState)
const props = { formState, formErrors }

test('does not render any error labels by default', () => {
  const wrapper = mountComponent({ props })
  expect(wrapper.find('.error').exists()).toBe(false)
})

describe('Amount input', () => {
  test('renders the expected label', () => {
    const wrapper = mountComponent({ props })
    const amountLabel = wrapper.findByText('label', 'Amount')

    expect(amountLabel.exists()).toBe(true)
  })

  test('renders an input with the expected attributes', () => {
    const wrapper = mountComponent({ props })
    const input = wrapper.get('input[name="amount"]')

    expect(input.attributes()).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        max: FINANCE_RECORD_MAX_AMOUNT.toString(),
        min: FINANCE_RECORD_MIN_AMOUNT.toString(),
        name: 'amount',
        required: '',
        step: FINANCE_RECORD_MIN_AMOUNT.toString(),
        type: INPUT_TYPE.NUMBER,
      }),
    )

    const inputElement = input.element as HTMLInputElement
    expect(inputElement.value).toBe(formState.amount.toString())
  })

  describe('with an amount error', () => {
    const propsWithError = {
      formState,
      formErrors: { ...formErrors, amount: 'Bad amount' },
    }

    test('renders an error label', () => {
      const wrapper = mountComponent({
        props: propsWithError,
      })
      const input = wrapper.get('input[name="amount"]')
      const errorLabel = wrapper.findByText('p', formErrors.amount)

      expect(errorLabel.attributes()).toEqual(
        expect.objectContaining({
          'aria-live': ARIA_LIVE.ASSERTIVE,
          id: `${input.element.id}-error`,
        }),
      )
    })
  })
})

describe('Type select', () => {
  test('renders the expected label', () => {
    const wrapper = mountComponent({ props })
    const label = wrapper.findByText('label', 'Type')

    expect(label.exists()).toBe(true)
  })

  test('renders a select element with the expected attributes', () => {
    const wrapper = mountComponent({ props })
    const select = wrapper.get('select')

    expect(select.attributes()).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        required: '',
      }),
    )

    const selectElement = select.element as HTMLSelectElement

    expect(selectElement.value).toBe(formState.type.toString())
  })

  test('renders the expected options', () => {
    const wrapper = mountComponent({ props })
    const allOptions = wrapper.findAll('option')

    expect(allOptions).toHaveLength(FINANCE_RECORD_TYPE_OPTIONS.length)

    // For each FINANCE_RECORD_TYPE_OPTION, there should be a matching <option>.
    FINANCE_RECORD_TYPE_OPTIONS.forEach((option) => {
      const matchingOption = allOptions.find((optionElement) => {
        return optionElement.element.value == option.value
      })

      expect(matchingOption).toBeDefined()

      let expectedSelectedValue
      if (matchingOption?.element.value == formState.type) {
        expectedSelectedValue = ''
      }

      expect(matchingOption?.attributes('selected')).toBe(expectedSelectedValue)
    })
  })
})

describe('Description input', () => {
  test('renders the expected label', () => {
    const wrapper = mountComponent({ props })
    const label = wrapper.findByText('label', 'Description')

    expect(label.exists()).toBe(true)
  })

  test('renders an input with the expected attributes', () => {
    const wrapper = mountComponent({ props })
    const input = wrapper.get('input[name="description"]')

    expect(input.attributes()).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'description',
        required: '',
        type: INPUT_TYPE.TEXT,
      }),
    )

    const inputElement = input.element as HTMLInputElement
    expect(inputElement.value).toBe(formState.description)
  })

  describe('with a description error', () => {
    const propsWithError = {
      formState,
      formErrors: { ...formErrors, description: 'Bad description' },
    }

    test('renders an error label', () => {
      const wrapper = mountComponent({
        props: propsWithError,
      })
      const input = wrapper.get('input[name="description"]')
      const errorLabel = wrapper.findByText('p', formErrors.description)

      expect(errorLabel.attributes()).toEqual(
        expect.objectContaining({
          'aria-live': ARIA_LIVE.ASSERTIVE,
          id: `${input.element.id}-error`,
        }),
      )
    })
  })
})

describe('Happened at input', () => {
  test('renders the expected label', () => {
    const wrapper = mountComponent({ props })
    const label = wrapper.findByText('label', 'Happened At')

    expect(label.exists()).toBe(true)
  })

  test('renders an input with the expected attributes', () => {
    const wrapper = mountComponent({ props })
    const input = wrapper.get('input[name="happenedAt"]')

    expect(input.attributes()).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: 'happenedAt',
        required: '',
        type: INPUT_TYPE.DATETIME_LOCAL,
      }),
    )

    const inputElement = input.element as HTMLInputElement
    expect(inputElement.value).toBe(formState.happenedAt)
  })

  describe('with a happenedAt error', () => {
    const propsWithError = {
      formState,
      formErrors: { ...formErrors, happenedAt: 'Bad happenedAt' },
    }

    test('renders an error label', () => {
      const wrapper = mountComponent({
        props: propsWithError,
      })
      const amountInput = wrapper.get('input[name="happenedAt"]')
      const errorLabel = wrapper.findByText('p', formErrors.happenedAt)

      expect(errorLabel.attributes()).toEqual(
        expect.objectContaining({
          'aria-live': ARIA_LIVE.ASSERTIVE,
          id: `${amountInput.element.id}-error`,
        }),
      )
    })
  })
})
