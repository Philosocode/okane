// External
import { flushPromises, VueWrapper } from '@vue/test-utils'

// Internal
import CreateFinanceRecordModal from '@features/financeRecords/components/CreateFinanceRecordModal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SaveFinanceRecordModal from '@features/financeRecords/components/SaveFinanceRecordModal.vue'

import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { useSaveFinanceRecordStore } from '@features/financeRecords/composables/useSaveFinanceRecordStore'

import { apiClient } from '@shared/services/apiClient/apiClient'
import { mapSaveFinanceRecordFormState } from '@features/financeRecords/utils/mappers'

import { createTestAPIFormErrors } from '@tests/factories/formErrors'
import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { createTestSaveFinanceRecordFormState } from '@tests/factories/financeRecord'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'

const mountComponent = getMountComponent(CreateFinanceRecordModal, {
  global: {
    stubs: {
      teleport: true,
    },
  },
  withQueryClient: true,
  withPinia: true,
})

beforeEach(() => {
  const saveStore = useSaveFinanceRecordStore()
  saveStore.setIsCreating(true)
})

const helpers = {
  setFormState(wrapper: VueWrapper, formState: SaveFinanceRecordFormState) {
    const modal = wrapper.getComponent(SaveFinanceRecordModal)
    modal.vm.$emit('change', formState)
  },
  async submitForm(wrapper: VueWrapper) {
    const modal = wrapper.getComponent(SaveFinanceRecordModal)
    modal.vm.$emit('submit')
    await flushPromises()
  },
}

test('does not render the modal content when not creating a finance record', () => {
  const saveStore = useSaveFinanceRecordStore()
  saveStore.setIsCreating(false)

  const wrapper = mountComponent()
  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.exists()).toBe(false)
})

test('renders the modal heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.getComponent(ModalHeading)
  expect(heading.text()).toBe(FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.CREATE_FINANCE_RECORD)
})

test('closes the modal', async () => {
  const wrapper = mountComponent()
  const modal = wrapper.getComponent(SaveFinanceRecordModal)
  modal.vm.$emit('close')
  const saveStore = useSaveFinanceRecordStore()
  expect(saveStore.isCreating).toBe(false)
})

describe('with a successful request to create a finance record', () => {
  const formState = createTestSaveFinanceRecordFormState({
    type: FINANCE_RECORD_TYPE.REVENUE,
  })

  test('makes a POST request to create a finance record', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue(wrapInAPIResponse(null))
    const wrapper = mountComponent()

    helpers.setFormState(wrapper, formState)
    await helpers.submitForm(wrapper)

    const financeRecord = mapSaveFinanceRecordFormState.to.preCreationFinanceRecord(formState)
    expect(postSpy).toHaveBeenCalledOnce()
    expect(postSpy).toHaveBeenCalledWith(financeRecordAPIRoutes.postFinanceRecord(), financeRecord)

    postSpy.mockRestore()
  })

  test('resets the amount and description', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue(wrapInAPIResponse(null))
    const wrapper = mountComponent()

    helpers.setFormState(wrapper, formState)
    await helpers.submitForm(wrapper)

    const amountInput = wrapper.get('input[name="amount"]').element as HTMLInputElement
    expect(amountInput.value).toBe('0')

    const descriptionInput = wrapper.get('input[name="description"]').element as HTMLInputElement
    expect(descriptionInput.value).toBe('')

    const happenedAtInput = wrapper.get('input[name="happenedAt"]').element as HTMLInputElement
    expect(happenedAtInput.value).toBe(formState.happenedAt)

    const typeSelect = wrapper.get('select').element as HTMLSelectElement
    expect(typeSelect.value).toBe(formState.type)

    postSpy.mockRestore()
  })

  test('resets the form errors', async () => {
    const apiErrors = createTestAPIFormErrors(formState)
    const postSpy = vi
      .spyOn(apiClient, 'post')
      .mockRejectedValueOnce(createTestProblemDetails(apiErrors))
      .mockResolvedValueOnce(wrapInAPIResponse(null))

    const wrapper = mountComponent()

    helpers.setFormState(wrapper, formState)
    await helpers.submitForm(wrapper)
    let amountError = wrapper.findByText('p', apiErrors.Amount[0])
    expect(amountError).toBeDefined()

    await helpers.submitForm(wrapper)
    amountError = wrapper.findByText('p', apiErrors.Amount[0])
    expect(amountError).toBeUndefined()

    postSpy.mockRestore()
  })
})

describe('with an error creating a finance record', () => {
  const formState = createTestSaveFinanceRecordFormState()

  test('displays the API errors', async () => {
    const apiErrors = createTestAPIFormErrors({
      amount: 0,
      description: '',
      happenedAt: '',
    })
    const postSpy = vi.spyOn(apiClient, 'post').mockRejectedValue(apiErrors)
    const wrapper = mountComponent()

    helpers.setFormState(wrapper, formState)
    await helpers.submitForm(wrapper)

    Object.values(apiErrors).forEach((errors) => {
      const [error] = errors
      const errorLabel = wrapper.findByText('p', error)
      expect(errorLabel).toBeDefined()
    })

    postSpy.mockRestore()
  })
})