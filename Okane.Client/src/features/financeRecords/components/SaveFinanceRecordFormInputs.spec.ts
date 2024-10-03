// Internal
import SaveFinanceRecordFormInputs from '@features/financeRecords/components/SaveFinanceRecordFormInputs.vue'

import { ARIA_LIVE } from '@shared/constants/aria'
import { INPUT_TYPE } from '@shared/constants/form'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import {
  FINANCE_RECORD_DESCRIPTION_MAX_LENGTH,
  FINANCE_RECORD_MAX_AMOUNT,
  FINANCE_RECORD_MIN_AMOUNT,
  FINANCE_RECORD_TYPE,
  FINANCE_RECORD_TYPE_OPTIONS,
} from '@features/financeRecords/constants/saveFinanceRecord'

import { type FormErrors } from '@shared/types/form'
import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { createTestSaveFinanceRecordFormState } from '@tests/factories/financeRecord'
import { getInitialFormErrors } from '@shared/utils/form'

const mountComponent = getMountComponent(SaveFinanceRecordFormInputs)

const formState = createTestSaveFinanceRecordFormState()
const formErrors = getInitialFormErrors(formState)
const props = { formState, formErrors }

const sharedTests = {
  emitsAChangeEvent: (args: {
    selector: string
    value: unknown
    emittedData: Partial<SaveFinanceRecordFormState>
  }) =>
    test('emits a change event', async () => {
      const wrapper = mountComponent({ props })
      const input = wrapper.get(args.selector)

      await input.setValue(args.value)

      const emitted = wrapper.emitted<Partial<SaveFinanceRecordFormState[]>>()
      const emittedData = emitted.change[0][0]

      expect(emittedData).toEqual(args.emittedData)
    }),
  rendersAnErrorLabel: (args: {
    errors: Partial<FormErrors<SaveFinanceRecordFormState>>
    selector: string
  }) =>
    test('renders an error label', () => {
      const wrapper = mountComponent({
        props: {
          ...props,
          formErrors: args.errors,
        },
      })

      const element = wrapper.get(args.selector)

      const firstError = Object.values(args.errors)[0]
      const errorLabel = wrapper.findByText('p', firstError)

      expect(errorLabel.attributes()).toEqual(
        expect.objectContaining({
          'aria-live': ARIA_LIVE.ASSERTIVE,
          id: `${element.element.id}-error`,
        }),
      )
    }),
}

const elementSelectors = {
  amountInput: 'input[name="amount"]',
  descriptionInput: 'input[name="description"]',
  happenedAtInput: 'input[name="happenedAt"]',
  typeSelect: 'select',
}

test('does not render any error labels by default', () => {
  const wrapper = mountComponent({ props })
  expect(wrapper.find('.error').exists()).toBe(false)
})

describe('Amount input', () => {
  test('renders the expected label', () => {
    const wrapper = mountComponent({ props })
    const amountLabel = wrapper.findByText('label', FINANCES_COPY.PROPERTIES.AMOUNT)
    expect(amountLabel.exists()).toBe(true)
  })

  test('renders an input with the expected attributes', () => {
    const wrapper = mountComponent({ props })
    const input = wrapper.get(elementSelectors.amountInput)

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

  describe('validity tests', () => {
    test.each([
      { amount: FINANCE_RECORD_MIN_AMOUNT, isValid: true },
      { amount: FINANCE_RECORD_MIN_AMOUNT + 1, isValid: true },
      { amount: FINANCE_RECORD_MAX_AMOUNT, isValid: true },

      { amount: '', isValid: false },
      { amount: '0.0001', isValid: false },
      { amount: '1234ABCD', isValid: false },
      { amount: FINANCE_RECORD_MIN_AMOUNT - FINANCE_RECORD_MIN_AMOUNT, isValid: false },
      { amount: FINANCE_RECORD_MAX_AMOUNT + FINANCE_RECORD_MIN_AMOUNT, isValid: false },
    ])('when value is $amount, checkValidity() returns $isValid', async ({ amount, isValid }) => {
      const wrapper = mountComponent({ props })
      const input = wrapper.get(elementSelectors.amountInput)

      await input.setValue(amount)

      const inputElement = input.element as HTMLInputElement
      expect(inputElement.checkValidity()).toBe(isValid)
    })
  })

  sharedTests.emitsAChangeEvent({
    selector: elementSelectors.amountInput,
    value: '1234',
    emittedData: { amount: 1234 },
  })

  sharedTests.rendersAnErrorLabel({
    selector: elementSelectors.amountInput,
    errors: { amount: 'Bad amount' },
  })
})

describe('Type select', () => {
  test('renders the expected label', () => {
    const wrapper = mountComponent({ props })
    const label = wrapper.findByText('label', FINANCES_COPY.PROPERTIES.TYPE)
    expect(label.exists()).toBe(true)
  })

  test('renders a select element with the expected attributes', () => {
    const wrapper = mountComponent({ props })
    const select = wrapper.get(`select[name='type']`)
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

  sharedTests.emitsAChangeEvent({
    selector: 'select',
    value: FINANCE_RECORD_TYPE.REVENUE,
    emittedData: { type: FINANCE_RECORD_TYPE.REVENUE },
  })
})

describe('Description input', () => {
  test('renders the expected label', () => {
    const wrapper = mountComponent({ props })
    const label = wrapper.findByText('label', FINANCES_COPY.PROPERTIES.DESCRIPTION)
    expect(label.exists()).toBe(true)
  })

  test('renders an input with the expected attributes', () => {
    const wrapper = mountComponent({ props })
    const input = wrapper.get(elementSelectors.descriptionInput)

    expect(input.attributes()).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        maxlength: FINANCE_RECORD_DESCRIPTION_MAX_LENGTH.toString(),
        name: 'description',
        required: '',
        type: INPUT_TYPE.TEXT,
      }),
    )

    const inputElement = input.element as HTMLInputElement
    expect(inputElement.value).toBe(formState.description)
  })

  sharedTests.emitsAChangeEvent({
    selector: elementSelectors.descriptionInput,
    value: 'Cool description',
    emittedData: { description: 'Cool description' },
  })

  sharedTests.rendersAnErrorLabel({
    selector: elementSelectors.descriptionInput,
    errors: { description: 'Bad description' },
  })
})

describe('Happened at input', () => {
  test('renders the expected label', () => {
    const wrapper = mountComponent({ props })
    const label = wrapper.findByText('label', FINANCES_COPY.PROPERTIES.HAPPENED_AT)
    expect(label.exists()).toBe(true)
  })

  test('renders an input with the expected attributes', () => {
    const wrapper = mountComponent({ props })
    const input = wrapper.get(elementSelectors.happenedAtInput)

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

  const happenedAt = '2024-08-06T19:41'

  sharedTests.emitsAChangeEvent({
    selector: elementSelectors.happenedAtInput,
    value: happenedAt,
    emittedData: { happenedAt: happenedAt },
  })

  sharedTests.rendersAnErrorLabel({
    selector: elementSelectors.happenedAtInput,
    errors: { happenedAt: 'Bad happenedAt' },
  })
})
