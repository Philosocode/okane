// External
import { flushPromises, VueWrapper } from '@vue/test-utils'

// Internal
import EditFinanceRecordModal from '@features/financeRecords/components/EditFinanceRecordModal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SaveFinanceRecordModal from '@features/financeRecords/components/SaveFinanceRecordModal.vue'

import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { useSaveFinanceRecordStore } from '@features/financeRecords/composables/useSaveFinanceRecordStore'

import {
  mapFinanceRecord,
  mapSaveFinanceRecordFormState,
} from '@features/financeRecords/utils/mappers'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { createTestAPIFormErrors } from '@tests/factories/formErrors'
import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'

const mountComponent = getMountComponent(EditFinanceRecordModal, {
  global: {
    stubs: {
      teleport: true,
    },
  },
  withQueryClient: true,
  withPinia: true,
})

const editingFinanceRecord = createTestFinanceRecord()
const initialFormState = mapFinanceRecord.to.saveFinanceRecordFormState(editingFinanceRecord)

beforeEach(() => {
  const saveStore = useSaveFinanceRecordStore()
  saveStore.setEditingFinanceRecord(editingFinanceRecord)
})

const helpers = {
  setFormState(wrapper: VueWrapper, formState: Partial<SaveFinanceRecordFormState>) {
    const modal = wrapper.getComponent(SaveFinanceRecordModal)
    modal.vm.$emit('change', formState)
  },
  async submitForm(wrapper: VueWrapper) {
    const modal = wrapper.getComponent(SaveFinanceRecordModal)
    modal.vm.$emit('submit')
    await flushPromises()
  },
}

test('does not render the modal content when not editing a finance record', () => {
  const saveStore = useSaveFinanceRecordStore()
  saveStore.setEditingFinanceRecord(undefined)

  const wrapper = mountComponent()
  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.exists()).toBe(false)
})

test('renders the modal heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.getComponent(ModalHeading)
  expect(heading.text()).toBe(FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.EDIT_FINANCE_RECORD)
})

test('closes the modal', async () => {
  const wrapper = mountComponent()
  const modal = wrapper.getComponent(SaveFinanceRecordModal)
  modal.vm.$emit('close')
  const saveStore = useSaveFinanceRecordStore()
  expect(saveStore.editingFinanceRecord).toBeUndefined()
})

test('sets the initial form state based on the editingFinanceRecord', async () => {
  const wrapper = mountComponent()

  const amountInput = wrapper.get('input[name="amount"]').element as HTMLInputElement
  expect(amountInput.value).toBe(initialFormState.amount.toString())

  const descriptionInput = wrapper.get('input[name="description"]').element as HTMLInputElement
  expect(descriptionInput.value).toBe(initialFormState.description)

  const happenedAtInput = wrapper.get('input[name="happenedAt"]').element as HTMLInputElement
  expect(happenedAtInput.value).toBe(initialFormState.happenedAt)

  const typeSelect = wrapper.get('select').element as HTMLSelectElement
  expect(typeSelect.value).toBe(initialFormState.type)
})

test('updates the form state when the initial form state changes', async () => {
  const wrapper = mountComponent()
  const updates = { amount: 100_000 }
  const saveStore = useSaveFinanceRecordStore()
  saveStore.setEditingFinanceRecord({ ...editingFinanceRecord, ...updates })

  await flushPromises()

  const amountInput = wrapper.get('input[name="amount"]').element as HTMLInputElement
  expect(amountInput.value).toBe(updates.amount.toString())
})

test("does not make a request when the form state hasn't changed", async () => {
  const patchSpy = vi.spyOn(apiClient, 'patch')
  const wrapper = mountComponent()

  await helpers.submitForm(wrapper)
  expect(patchSpy).not.toHaveBeenCalled()

  patchSpy.mockRestore()
})

describe('with a successful request to edit a finance record', () => {
  const updates = { amount: 10_000 }

  test('makes a PATCH request to update the finance record', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue(wrapInAPIResponse(null))
    const wrapper = mountComponent()

    helpers.setFormState(wrapper, updates)
    await helpers.submitForm(wrapper)

    const financeRecord = mapSaveFinanceRecordFormState.to.partialFinanceRecord(updates)
    expect(patchSpy).toHaveBeenCalledOnce()
    expect(patchSpy).toHaveBeenCalledWith(
      financeRecordAPIRoutes.patchFinanceRecord({ id: editingFinanceRecord.id }),
      financeRecord,
    )

    patchSpy.mockRestore()
  })

  test('closes the form', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue(wrapInAPIResponse(null))
    const wrapper = mountComponent()

    helpers.setFormState(wrapper, updates)
    await helpers.submitForm(wrapper)

    const saveStore = useSaveFinanceRecordStore()
    expect(saveStore.editingFinanceRecord).toBeUndefined()

    patchSpy.mockRestore()
  })

  test('resets the form errors', async () => {
    const apiErrors = createTestAPIFormErrors(initialFormState)
    const patchSpy = vi
      .spyOn(apiClient, 'patch')
      .mockRejectedValueOnce(createTestProblemDetails(apiErrors))
      .mockResolvedValueOnce(wrapInAPIResponse(null))

    const wrapper = mountComponent()

    helpers.setFormState(wrapper, updates)
    await helpers.submitForm(wrapper)

    let amountError = wrapper.findByText('p', apiErrors.Amount[0])
    expect(amountError).toBeDefined()

    await helpers.submitForm(wrapper)
    amountError = wrapper.findByText('p', apiErrors.Amount[0])
    expect(amountError).toBeUndefined()

    patchSpy.mockRestore()
  })
})

describe('with an error updating a finance record', () => {
  test('displays the API errors', async () => {
    const apiErrors = createTestAPIFormErrors({
      amount: 0,
      description: '',
      happenedAt: '',
    })
    const patchSpy = vi.spyOn(apiClient, 'patch').mockRejectedValue(apiErrors)
    const wrapper = mountComponent()

    helpers.setFormState(wrapper, { amount: 10_000 })
    await helpers.submitForm(wrapper)

    Object.values(apiErrors).forEach((errors) => {
      const [error] = errors
      const errorLabel = wrapper.findByText('p', error)
      expect(errorLabel).toBeDefined()
    })

    patchSpy.mockRestore()
  })
})