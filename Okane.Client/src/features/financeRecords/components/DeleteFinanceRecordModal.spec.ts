// External
import { flushPromises } from '@vue/test-utils'
import { toValue } from 'vue'

import { type HttpHandler } from 'msw'

// Internal
import DeleteFinanceRecordModal from '@features/financeRecords/components/DeleteFinanceRecordModal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

import { DEFAULT_FINANCE_RECORD_SEARCH_FILTERS } from '@features/financeRecords/constants/searchFinanceRecords'
import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import * as deleteMutation from '@features/financeRecords/composables/useDeleteFinanceRecordMutation'
import { useDeleteFinanceRecordStore } from '@features/financeRecords/composables/useDeleteFinanceRecordStore'

import { financeRecordHandlers } from '@tests/msw/handlers/financeRecord'
import { testServer } from '@tests/msw/testServer'

const financeRecordId = 540
const searchFilters = DEFAULT_FINANCE_RECORD_SEARCH_FILTERS

const helpers = {
  setFinanceRecordId() {
    const store = useDeleteFinanceRecordStore()
    store.setDeletingFinanceRecordId(financeRecordId)
  },
}

const mountComponent = getMountComponent(DeleteFinanceRecordModal, {
  global: {
    stubs: {
      teleport: true,
    },
  },
  withPinia: true,
  withQueryClient: true,
})

test('does not render the modal content when the finance record ID is empty', () => {
  const wrapper = mountComponent()
  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.exists()).toBe(false)
})

test('renders the modal heading', () => {
  helpers.setFinanceRecordId()

  const wrapper = mountComponent()
  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.text()).toBe(FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.DELETE_FINANCE_RECORD)
})

test('renders the confirmation text', () => {
  helpers.setFinanceRecordId()

  const wrapper = mountComponent()
  const text = wrapper.findByText('p', FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.ARE_YOU_SURE)
  expect(text.exists()).toBe(true)
})

test('renders a cancel button to close the modal', async () => {
  const store = useDeleteFinanceRecordStore()
  helpers.setFinanceRecordId()
  const wrapper = mountComponent()

  const cancelButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.CANCEL)
  await cancelButton.trigger('click')
  expect(store.financeRecordId).toBeUndefined()
})

describe('when clicking the delete button', () => {
  async function setUp(
    handler: HttpHandler = financeRecordHandlers.deleteFinanceRecordSuccess({
      id: financeRecordId,
    }),
  ) {
    testServer.use(handler)

    helpers.setFinanceRecordId()

    const wrapper = mountComponent()

    const deleteButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.DELETE)
    await deleteButton.trigger('click')

    await flushPromises()

    return wrapper
  }

  test('calls useDeleteFinanceRecordMutation with the query key', async () => {
    const deleteSpy = vi.spyOn(deleteMutation, 'useDeleteFinanceRecordMutation')
    await setUp()

    expect(deleteSpy).toHaveBeenCalledOnce()

    const calledWith = deleteSpy.mock.calls[0]
    const [queryKey] = calledWith
    expect(toValue(queryKey)).toEqual(financeRecordQueryKeys.listByFilters(searchFilters))

    deleteSpy.mockRestore()
  })

  test('closes the modal when the DELETE request is successful', async () => {
    await setUp()
    const deleteStore = useDeleteFinanceRecordStore()
    expect(deleteStore.financeRecordId).toBeUndefined()
  })

  test("does not close the modal when there's an error deleting the finance record", async () => {
    await setUp(financeRecordHandlers.deleteFinanceRecordError({ id: financeRecordId }))
    const deleteStore = useDeleteFinanceRecordStore()
    expect(deleteStore.financeRecordId).toBe(financeRecordId)
  })
})
