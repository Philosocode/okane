// External
import { flushPromises } from '@vue/test-utils'
import { toRef } from 'vue'

import { type HttpHandler } from 'msw'

// Internal
import DeleteFinanceRecordModal from '@features/financeRecords/components/DeleteFinanceRecordModal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

import { financeRecordQueryKeys } from '@features/financeRecords/constants/queryKeys'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'
import {
  DEFAULT_FINANCE_RECORD_SEARCH_FILTERS,
  FINANCE_RECORD_SEARCH_FILTERS_KEY,
} from '@features/financeRecords/constants/searchFilters'

import * as deleteMutation from '@features/financeRecords/composables/useDeleteFinanceRecordMutation'

import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { financeRecordHandlers } from '@tests/msw/handlers/financeRecord'
import { testServer } from '@tests/msw/testServer'

const financeRecord = createTestFinanceRecord()
const searchFilters = DEFAULT_FINANCE_RECORD_SEARCH_FILTERS

const mountComponent = getMountComponent(DeleteFinanceRecordModal, {
  props: {
    financeRecordId: financeRecord.id,
  },
  global: {
    provide: {
      [FINANCE_RECORD_SEARCH_FILTERS_KEY as symbol]: toRef(searchFilters),
    },
    stubs: {
      teleport: true,
    },
  },
  withQueryClient: true,
})

test('does not render the modal content when the finance record ID is empty', () => {
  const wrapper = mountComponent({
    props: {
      financeRecordId: null,
    },
  })

  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.exists()).toBe(false)
})

test('renders the modal heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.text()).toBe(FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.DELETE_FINANCE_RECORD)
})

test('renders the confirmation text', () => {
  const wrapper = mountComponent()
  const text = wrapper.findByText('p', FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.ARE_YOU_SURE)
  expect(text.exists()).toBe(true)
})

test('renders a cancel button to close the modal', async () => {
  const wrapper = mountComponent()
  expect(wrapper.emitted('close')).toBeUndefined()

  const cancelButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.CANCEL)
  await cancelButton.trigger('click')

  expect(wrapper.emitted('close')).toBeDefined()
})

describe('when clicking the delete button', () => {
  async function setUp(
    handler: HttpHandler = financeRecordHandlers.deleteFinanceRecordSuccess({
      id: financeRecord.id,
    }),
  ) {
    testServer.use(handler)

    const wrapper = mountComponent()

    const deleteButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.DELETE)
    await deleteButton.trigger('click')

    await flushPromises()

    return wrapper
  }

  test('calls useDeleteFinanceRecordMutation with the expected ARGs', async () => {
    const deleteSpy = vi.spyOn(deleteMutation, 'useDeleteFinanceRecordMutation')
    await setUp()

    expect(deleteSpy).toHaveBeenCalledOnce()

    const calledWith = deleteSpy.mock.calls[0]
    const [financeRecordId, queryKey] = calledWith
    expect(financeRecordId.value).toEqual(financeRecord.id)
    expect(queryKey.value).toEqual(financeRecordQueryKeys.listByFilters(searchFilters))

    deleteSpy.mockRestore()
  })

  test('deletes the finance record and closes the modal with successful request', async () => {
    const wrapper = await setUp()
    expect(wrapper.emitted('close')).toBeDefined()
  })

  test("does not close the modal when there's an error deleting the finance record", async () => {
    const wrapper = await setUp(
      financeRecordHandlers.deleteFinanceRecordError({ id: financeRecord.id }),
    )
    expect(wrapper.emitted('close')).toBeUndefined()
  })
})
