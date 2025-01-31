// External
import { flushPromises, VueWrapper } from '@vue/test-utils'

// Internal
import CardHeading from '@shared/components/typography/CardHeading.vue'
import EditFinanceRecordModal from '@features/financeRecords/components/EditFinanceRecordModal.vue'
import SaveFinanceRecordModal from '@features/financeRecords/components/SaveFinanceRecordModal.vue'

import { financeRecordAPIRoutes } from '@features/financeRecords/constants/apiRoutes'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'

import { type SaveFinanceRecordFormState } from '@features/financeRecords/types/saveFinanceRecord'

import { useToastStore } from '@shared/composables/useToastStore'

import {
  mapFinanceRecord,
  mapSaveFinanceRecordFormState,
} from '@features/financeRecords/utils/mappers'

import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'
import {
  SAVE_FINANCE_RECORD_SYMBOL,
  type SaveFinanceRecordProvider,
  useSaveFinanceRecordProvider,
} from '@features/financeRecords/providers/saveFinanceRecordProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { createTestAPIFormErrors } from '@tests/factories/formErrors'
import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { financeUserTagHandlers } from '@tests/msw/handlers/financeUserTag'
import { useMockedStore } from '@tests/composables/useMockedStore'
import { testServer } from '@tests/msw/testServer'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'

const editingFinanceRecord = createTestFinanceRecord()
const initialFormState = mapFinanceRecord.to.saveFinanceRecordFormState(editingFinanceRecord)

const helpers = {
  getEditingSaveProvider() {
    const saveProvider = useSaveFinanceRecordProvider()
    saveProvider.setEditingFinanceRecord(editingFinanceRecord)

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
        [SEARCH_FINANCE_RECORDS_SYMBOL]: useSearchFinanceRecordsProvider(),
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
  saveProvider.setEditingFinanceRecord(undefined)

  const wrapper = mountWithProviders({ saveProvider })
  const heading = wrapper.findComponent(CardHeading)
  expect(heading.exists()).toBe(false)
})

test('renders the modal heading', () => {
  const wrapper = mountWithProviders()
  const heading = wrapper.getComponent(CardHeading)
  expect(heading.text()).toBe(FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.EDIT_FINANCE_RECORD)
})

test('closes the modal', async () => {
  const saveProvider = helpers.getEditingSaveProvider()
  const wrapper = mountWithProviders({ saveProvider })
  const modal = wrapper.getComponent(SaveFinanceRecordModal)
  modal.vm.$emit('close')
  expect(saveProvider.editingFinanceRecord).toBeUndefined()
})

test('sets the initial form state based on the editingFinanceRecord', async () => {
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

test('updates the form state when the initial form state changes', async () => {
  const updates = { amount: 100_000 }
  const saveProvider = useSaveFinanceRecordProvider()
  saveProvider.setEditingFinanceRecord({ ...editingFinanceRecord, ...updates })

  const wrapper = mountWithProviders({ saveProvider })
  const amountInput = wrapper.get('input[name="amount"]').element as HTMLInputElement
  expect(amountInput.value).toBe(updates.amount.toString())
})

test('closes the modal without making a request when the form state is unchanged', async () => {
  const saveProvider = useSaveFinanceRecordProvider()
  saveProvider.setEditingFinanceRecord(editingFinanceRecord)

  const patchSpy = vi.spyOn(apiClient, 'patch')
  const wrapper = mountWithProviders({ saveProvider })

  await helpers.submitForm(wrapper)
  expect(patchSpy).not.toHaveBeenCalled()
  expect(saveProvider.editingFinanceRecord).toBeUndefined()
})

describe('with a successful request to edit a finance record', () => {
  const updates = { amount: 10_000 }

  test('makes a PATCH request to update the finance record', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue(wrapInAPIResponse(null))
    const wrapper = mountWithProviders()

    helpers.setFormState(wrapper, updates)
    await helpers.submitForm(wrapper)

    const financeRecord = mapSaveFinanceRecordFormState.to.editFinanceRecordRequest(updates)
    expect(patchSpy).toHaveBeenCalledOnce()
    expect(patchSpy).toHaveBeenCalledWith(
      financeRecordAPIRoutes.patchFinanceRecord({ id: editingFinanceRecord.id }),
      financeRecord,
    )
  })

  test('creates a toast', async () => {
    const toastStore = useMockedStore(useToastStore)
    const createToastSpy = vi.spyOn(toastStore, 'createToast')
    vi.spyOn(apiClient, 'patch').mockResolvedValue(wrapInAPIResponse(null))
    const saveProvider = helpers.getEditingSaveProvider()
    const wrapper = mountWithProviders({ saveProvider })

    helpers.setFormState(wrapper, updates)
    expect(createToastSpy).not.toHaveBeenCalled()
    await helpers.submitForm(wrapper)
    expect(createToastSpy).toHaveBeenCalledOnce()
    expect(createToastSpy).toHaveBeenCalledWith(
      FINANCES_COPY.SAVE_FINANCE_RECORD_MODAL.EDIT_SUCCESS_TOAST,
    )
  })

  test('closes the form', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValue(wrapInAPIResponse(null))
    const saveProvider = helpers.getEditingSaveProvider()
    const wrapper = mountWithProviders({ saveProvider })

    helpers.setFormState(wrapper, updates)
    await helpers.submitForm(wrapper)

    expect(saveProvider.editingFinanceRecord).toBeUndefined()
  })

  test('resets the form errors', async () => {
    const apiErrors = createTestAPIFormErrors(initialFormState)
    vi.spyOn(apiClient, 'patch')
      .mockRejectedValueOnce(createTestProblemDetails(apiErrors))
      .mockResolvedValueOnce(wrapInAPIResponse(null))

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
    const apiErrors = createTestAPIFormErrors({
      amount: 0,
      description: '',
      happenedAt: '',
    })
    vi.spyOn(apiClient, 'patch').mockRejectedValue(apiErrors)
    const wrapper = mountWithProviders()

    helpers.setFormState(wrapper, { amount: 10_000 })
    await helpers.submitForm(wrapper)

    Object.values(apiErrors).forEach((errors) => {
      const [error] = errors
      const errorLabel = wrapper.findByText('p', error)
      expect(errorLabel).toBeDefined()
    })
  })
})
