// External
import { toRef } from 'vue'
import { http, HttpResponse } from 'msw'
import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import Modal from '@shared/components/modal/Modal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SaveFinanceRecordForm from '@features/financeRecords/components/SaveFinanceRecordForm.vue'
import SaveFinanceRecordFormInputs from '@features/financeRecords/components/SaveFinanceRecordFormInputs.vue'

import { BUTTON_TYPE } from '@shared/constants/form.constants'
import {
  FINANCE_RECORD_MAX_AMOUNT,
  FINANCE_RECORD_MIN_AMOUNT,
  FINANCE_RECORD_TYPE,
} from '@features/financeRecords/constants/financeRecord.constants'

import * as useModal from '@shared/composables/useModal'
import * as useSaveFinanceRecord from '@features/financeRecords/composables/useSaveFinanceRecord.composable'

import { spyOnDate } from '@tests/spies/date.spies'
import { testServer } from '@tests/msw/testServer'

import { createStubAPIFormErrors } from '@tests/factories/formErrors.factory'
import { createStubProblemDetails } from '@tests/factories/problemDetails.factory'
import { createStubSaveFinanceRecordFormState } from '@tests/factories/financeRecord.factory'
import { mapSaveFinanceRecordFormStateToFinanceRecord } from '@features/financeRecords/utils/financeRecord.utils'

const mountComponent = getMountComponent(SaveFinanceRecordForm, {
  global: {
    stubs: {
      teleport: true,
    },
  },
})

const spyOn = {
  useModal() {
    const mockedFunctions = { showModal: vi.fn(), closeModal: vi.fn() }
    const spy = vi.spyOn(useModal, 'useModal').mockReturnValue({
      modalIsShowing: toRef(true),
      ...mockedFunctions,
    })

    return {
      spy,
      ...mockedFunctions,
    }
  },
  useSaveFinanceRecord() {
    const mockSave = vi.fn()
    const spy = vi.spyOn(useSaveFinanceRecord, 'useSaveFinanceRecord').mockReturnValue({
      saveFinanceRecord: mockSave,
    })

    return { spy, saveFinanceRecord: mockSave }
  },
}

beforeEach(() => {
  vitest.restoreAllMocks()
})

test('renders a button to show the modal', async () => {
  const { showModal } = spyOn.useModal()

  const wrapper = mountComponent()
  const button = wrapper.findByText('button', 'Show Modal')

  expect(button.exists()).toBe(true)
  expect(showModal).not.toHaveBeenCalled()

  await button.trigger('click')

  expect(showModal).toHaveBeenCalledOnce()
})

test('renders a modal', () => {
  const wrapper = mountComponent()
  const modal = wrapper.findComponent(Modal)

  expect(modal.exists()).toBe(true)
})

test('renders a modal heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.getComponent(ModalHeading)

  expect(heading.text()).toBe('Create Finance Record')
})

test("renders the form's inputs", () => {
  const wrapper = mountComponent()
  const inputs = wrapper.findComponent(SaveFinanceRecordFormInputs)

  expect(inputs.exists()).toBe(true)
})

test('renders a save button', async () => {
  const wrapper = mountComponent()
  const button = wrapper.findByText('button', 'Save')

  expect(button.exists()).toBe(true)
  expect(button.attributes('type')).toBe(BUTTON_TYPE.SUBMIT)
})

test('renders a cancel button to close the modal', async () => {
  const { closeModal } = spyOn.useModal()

  const wrapper = mountComponent()
  const button = wrapper.findByText('button', 'Cancel')

  expect(button.exists()).toBe(true)
  expect(button.attributes('type')).toBe(BUTTON_TYPE.BUTTON)

  expect(closeModal).not.toHaveBeenCalledOnce()

  await button.trigger('click')

  expect(closeModal).toHaveBeenCalledOnce()
})

const formState = createStubSaveFinanceRecordFormState({
  type: FINANCE_RECORD_TYPE.REVENUE,
  description: 'Cool Revenue',
})

const elements = {
  amountInput: (wrapper: VueWrapper) => wrapper.get('input[name="amount"]'),
  descriptionInput: (wrapper: VueWrapper) => wrapper.get('input[name="description"]'),
  happenedAtInput: (wrapper: VueWrapper) => wrapper.get('input[name="happenedAt"]'),
  typeSelect: (wrapper: VueWrapper) => wrapper.get('select'),

  saveButton: (wrapper: VueWrapper) => wrapper.findByText('button', 'Save'),
}

async function populateAllInputs(wrapper: VueWrapper) {
  const amountInput = elements.amountInput(wrapper)
  await amountInput.setValue(formState.amount)

  const typeSelect = elements.typeSelect(wrapper)
  await typeSelect.setValue(formState.type)

  const descriptionInput = elements.descriptionInput(wrapper)
  await descriptionInput.setValue(formState.description)

  const happenedAtInput = elements.happenedAtInput(wrapper)
  await happenedAtInput.setValue(formState.happenedAt)
}

async function clickOnSaveButton(wrapper: VueWrapper) {
  const saveButton = elements.saveButton(wrapper)
  await saveButton.trigger('click')
}

describe('with some form inputs filled', () => {
  async function assertDoesNotCreateAFinanceRecordWithInvalidInput(
    afterInputPopulationHook: (wrapper: VueWrapper) => Promise<void>,
  ) {
    const { saveFinanceRecord } = spyOn.useSaveFinanceRecord()
    const wrapper = mountComponent()

    await populateAllInputs(wrapper)
    await afterInputPopulationHook(wrapper)
    await clickOnSaveButton(wrapper)

    expect(saveFinanceRecord).not.toHaveBeenCalled()
  }

  describe('amount input', () => {
    const invalidAmountValues = [
      [''],
      ['0'],
      ['abc'],
      ['123abc'],
      ['0.0001'],
      [(FINANCE_RECORD_MIN_AMOUNT - 0.01).toString()],
      [(FINANCE_RECORD_MAX_AMOUNT + 0.01).toString()],
    ]

    test.each(invalidAmountValues)(
      'does not create a finance record when the amount input value is %s',
      async (value) => {
        await assertDoesNotCreateAFinanceRecordWithInvalidInput(async (wrapper) => {
          const amountInput = elements.amountInput(wrapper)
          await amountInput.setValue(value)
        })
      },
    )
  })

  test('does not create a finance record when description is empty', async () => {
    await assertDoesNotCreateAFinanceRecordWithInvalidInput(async (wrapper) => {
      const descriptionInput = elements.descriptionInput(wrapper)
      await descriptionInput.setValue('')
    })
  })

  test('does not create a finance record when happenedAt is empty', async () => {
    await assertDoesNotCreateAFinanceRecordWithInvalidInput(async (wrapper) => {
      const happenedAtInput = elements.happenedAtInput(wrapper)
      await happenedAtInput.setValue('')
    })
  })
})

describe('with a valid form state', () => {
  async function setUp() {
    spyOnDate.now()

    const { saveFinanceRecord } = spyOn.useSaveFinanceRecord()
    const wrapper = mountComponent()

    await populateAllInputs(wrapper)

    const saveButton = elements.saveButton(wrapper)
    await saveButton.trigger('click')

    return { saveFinanceRecord, wrapper }
  }

  test('creates a finance record', async () => {
    const { saveFinanceRecord } = await setUp()

    expect(saveFinanceRecord).toHaveBeenCalledWith(
      mapSaveFinanceRecordFormStateToFinanceRecord(formState),
    )
  })

  test('does not reset the type state', async () => {
    const { wrapper } = await setUp()
    const typeSelect = elements.typeSelect(wrapper).element as HTMLSelectElement

    expect(typeSelect.value).toBe(formState.type)
  })

  test('does not reset the happenedAt state', async () => {
    const { wrapper } = await setUp()
    const happenedAtInput = elements.happenedAtInput(wrapper).element as HTMLInputElement

    // If this input was reset, its value would become mockedNow.
    // However, since it shouldn't have been reset, its value should match formState.happenedAt.
    expect(happenedAtInput.value).toBe(formState.happenedAt)
  })

  test('resets the amount state', async () => {
    const { wrapper } = await setUp()

    const amountInput = elements.amountInput(wrapper).element as HTMLInputElement
    expect(amountInput.value).toBe('0')
  })

  test('resets the description state', async () => {
    const { wrapper } = await setUp()
    const descriptionInput = elements.descriptionInput(wrapper).element as HTMLInputElement

    expect(descriptionInput.value).toBe('')
  })
})

describe('with an error creating the finance record', () => {
  const formErrors = createStubAPIFormErrors(formState)

  beforeEach(() => {
    testServer.use(
      http.post('/api/finance-records', () => {
        const problemDetails = createStubProblemDetails({ errors: formErrors })
        return HttpResponse.json(problemDetails, { status: problemDetails.status })
      }),
    )
  })

  test('renders the API response errors', async () => {
    const wrapper = mountComponent()

    await populateAllInputs(wrapper)
    await clickOnSaveButton(wrapper)
    await flushPromises()

    const expectedKeys = ['amount', 'description', 'happenedAt'] as const

    expectedKeys.forEach((key) => {
      expect(wrapper.findByText('p', `${key} error`).exists()).toBe(true)
    })
  })
})
