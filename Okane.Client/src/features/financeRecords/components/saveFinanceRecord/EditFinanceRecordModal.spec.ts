// External
import { flushPromises, VueWrapper } from '@vue/test-utils'

// Internal
import CardHeading from '@shared/components/typography/CardHeading.vue'
import EditFinanceRecordModal from '@features/financeRecords/components/saveFinanceRecord/EditFinanceRecordModal.vue'
import SaveFinanceRecordModal from '@features/financeRecords/components/saveFinanceRecord/SaveFinanceRecordModal.vue'

import { financeRecordApiRoutes } from '@features/financeRecords/constants/apiRoutes'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { useToastStore } from '@shared/composables/useToastStore'

import {
  mapFinanceRecord,
  mapSaveFinanceRecordFormState,
} from '@features/financeRecords/utils/mappers'

import {
  SAVE_FINANCE_RECORD_SYMBOL,
  type SaveFinanceRecordProvider,
  useSaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { createTestApiFormErrors } from '@tests/factories/formErrors'
import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { financeUserTagHandlers } from '@tests/msw/handlers/financeUserTag'
import { useMockedStore } from '@tests/composables/useMockedStore'
import { testServer } from '@tests/msw/testServer'
import { wrapInApiResponse } from '@tests/utils/apiResponse'

const financeRecordToEdit = createTestFinanceRecord()
const initialFormState = mapFinanceRecord.to.saveFinanceRecordFormState(financeRecordToEdit)

const helpers = {
  getEditingSaveProvider() {
    const saveProvider = useSaveFinanceRecordProvider()
    saveProvider.setFinanceRecordToEdit(financeRecordToEdit)

    return saveProvider
  },
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

function mountWithProviders(args: { saveProvider?: SaveFinanceRecordProvider } = {}) {
  testServer.use(financeUserTagHandlers.getAllSuccess({ userTags: [] }))
  const saveProvider = args.saveProvider ?? helpers.getEditingSaveProvider()

  return getMountComponent(EditFinanceRecordModal, {
    global: {
      provide: {
        [SAVE_FINANCE_RECORD_SYMBOL]: saveProvider,
      },
      stubs: {
        teleport: true,
      },
    },
    withQueryClient: true,
  })()
}

test('does not render the modal content when not editing a finance record', () => {
  const saveProvider = useSaveFinanceRecordProvider()
  saveProvider.setFinanceRecordToEdit(undefined)

  const wrapper = mountWithProviders({ saveProvider })
  const heading = wrapper.findComponent(CardHeading)
  expect(heading.exists()).toBe(false)
})

test('renders the modal heading', () => {
  const wrapper = mountWithProviders()
  const heading = wrapper.getComponent(CardHeading)
  expect(heading.text()).toBe(FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.EDIT_FINANCE_RECORD)
})

test('closes the modal', () => {
  const saveProvider = helpers.getEditingSaveProvider()
  const wrapper = mountWithProviders({ saveProvider })
  const modal = wrapper.getComponent(SaveFinanceRecordModal)
  modal.vm.$emit('close')
  expect(saveProvider.financeRecordToEdit).toBeUndefined()
})

test('sets the initial form state based on the financeRecordToEdit', () => {
  const wrapper = mountWithProviders()

  const amountInput = wrapper.get('input[name="amount"]').element as HTMLInputElement
  expect(amountInput.value).toBe(initialFormState.amount.toString())

  const descriptionInput = wrapper.get('input[name="description"]').element as HTMLInputElement
  expect(descriptionInput.value).toBe(initialFormState.description)

  const happenedAtInput = wrapper.get('input[name="happenedAt"]').element as HTMLInputElement
  expect(happenedAtInput.value).toBe(initialFormState.happenedAt)

  const typeSelect = wrapper.get('select').element as HTMLSelectElement
  expect(typeSelect.value).toBe(initialFormState.type)
})

test('updates the form state when the initial form state changes', () => {
  const updates = { amount: 100_000 }
  const saveProvider = useSaveFinanceRecordProvider()
  saveProvider.setFinanceRecordToEdit({ ...financeRecordToEdit, ...updates })

  const wrapper = mountWithProviders({ saveProvider })
  const amountInput = wrapper.get('input[name="amount"]').element as HTMLInputElement
  expect(amountInput.value).toBe(updates.amount.toString())
})

test('closes the modal without making a request when the form state is unchanged', async () => {
  const saveProvider = useSaveFinanceRecordProvider()
  saveProvider.setFinanceRecordToEdit(financeRecordToEdit)

  const patchSpy = vi.spyOn(apiClient, 'patch')
  const wrapper = mountWithProviders({ saveProvider })

  await helpers.submitForm(wrapper)
  expect(patchSpy).not.toHaveBeenCalled()
  expect(saveProvider.financeRecordToEdit).toBeUndefined()
})

describe('with a successful request to edit a finance record', () => {
  const updates = { amount: '10000' }

  test('makes a PATCH request to update the finance record', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue(wrapInApiResponse(null))
    const wrapper = mountWithProviders()

    helpers.setFormState(wrapper, updates)
    await helpers.submitForm(wrapper)

    const financeRecord = mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(updates)
    expect(patchSpy).toHaveBeenCalledOnce()
    expect(patchSpy).toHaveBeenCalledWith(
      financeRecordApiRoutes.patchFinanceRecord({ id: financeRecordToEdit.id }),
      financeRecord,
    )
  })

  test('creates a toast', async () => {
    const toastStore = useMockedStore(useToastStore)
    const createToastSpy = vi.spyOn(toastStore, 'createToast')
    vi.spyOn(apiClient, 'patch').mockResolvedValue(wrapInApiResponse(null))
    const saveProvider = helpers.getEditingSaveProvider()
    const wrapper = mountWithProviders({ saveProvider })

    helpers.setFormState(wrapper, updates)
    expect(createToastSpy).not.toHaveBeenCalled()
    await helpers.submitForm(wrapper)
    expect(createToastSpy).toHaveBeenCalledOnce()
    expect(createToastSpy).toHaveBeenCalledWith(
      FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.TOASTS.EDIT_SUCCESS,
    )
  })

  test('closes the form', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValue(wrapInApiResponse(null))
    const saveProvider = helpers.getEditingSaveProvider()
    const wrapper = mountWithProviders({ saveProvider })

    helpers.setFormState(wrapper, updates)
    await helpers.submitForm(wrapper)

    expect(saveProvider.financeRecordToEdit).toBeUndefined()
  })

  test('resets the form errors', async () => {
    const apiErrors = createTestApiFormErrors(initialFormState)
    vi.spyOn(apiClient, 'patch')
      .mockRejectedValueOnce(createTestProblemDetails(apiErrors))
      .mockResolvedValueOnce(wrapInApiResponse(null))

    const wrapper = mountWithProviders()

    helpers.setFormState(wrapper, updates)
    await helpers.submitForm(wrapper)

    let amountError = wrapper.findByText('p', apiErrors.Amount[0])
    expect(amountError).toBeDefined()

    await helpers.submitForm(wrapper)
    amountError = wrapper.findByText('p', apiErrors.Amount[0])
    expect(amountError).toBeUndefined()
  })
})

describe('with an error updating a finance record', () => {
  test('displays the API errors', async () => {
    const apiErrors = createTestApiFormErrors({
      amount: 0,
      description: '',
      happenedAt: '',
    })
    vi.spyOn(apiClient, 'patch').mockRejectedValue(apiErrors)
    const wrapper = mountWithProviders()

    helpers.setFormState(wrapper, { amount: '10000' })
    await helpers.submitForm(wrapper)

    Object.values(apiErrors).forEach((errors) => {
      const [error] = errors
      const errorLabel = wrapper.findByText('p', error)
      expect(errorLabel).toBeDefined()
    })
  })
})
