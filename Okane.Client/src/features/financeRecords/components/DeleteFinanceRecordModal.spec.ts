// External
import { flushPromises } from '@vue/test-utils'

import { type HttpHandler } from 'msw'

// Internal
import DeleteFinanceRecordModal from '@features/financeRecords/components/DeleteFinanceRecordModal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import {
  DELETE_FINANCE_RECORD_ID_SYMBOL,
  type DeleteFinanceRecordIdProvider,
  useDeleteFinanceRecordId,
} from '@features/financeRecords/providers/deleteFinanceRecordIdProvider'
import {
  SEARCH_FINANCE_RECORDS_SYMBOL,
  useSearchFinanceRecordsProvider,
} from '@features/financeRecords/providers/searchFinanceRecordsProvider'

import * as deleteMutation from '@features/financeRecords/composables/useDeleteFinanceRecord'

import { commonAsserts } from '@tests/utils/commonAsserts'
import { financeRecordHandlers } from '@tests/msw/handlers/financeRecord'
import { testServer } from '@tests/msw/testServer'

const financeRecordId = 540
const mountComponent = getMountComponent(DeleteFinanceRecordModal, {
  global: {
    provide: {
      [DELETE_FINANCE_RECORD_ID_SYMBOL]: useDeleteFinanceRecordId(),
      [SEARCH_FINANCE_RECORDS_SYMBOL]: useSearchFinanceRecordsProvider(),
    },
    stubs: {
      teleport: true,
    },
  },
  withQueryClient: true,
})

const helpers = {
  getDeleteProviderWithIdSet() {
    const deleteProvider = useDeleteFinanceRecordId()

    deleteProvider.setId(financeRecordId)

    return deleteProvider
  },
}

function mountComponentWithDeleteProvider(provider: DeleteFinanceRecordIdProvider) {
  return mountComponent({
    global: {
      provide: {
        [DELETE_FINANCE_RECORD_ID_SYMBOL]: provider,
      },
    },
  })
}

test('does not render the modal content when the finance record ID is empty', () => {
  const wrapper = mountComponentWithDeleteProvider(useDeleteFinanceRecordId())
  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.exists()).toBe(false)
})

test('renders the modal heading', () => {
  const deleteProvider = helpers.getDeleteProviderWithIdSet()
  const wrapper = mountComponentWithDeleteProvider(deleteProvider)
  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.text()).toBe(FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.DELETE_FINANCE_RECORD)
})

test('renders an accessible modal', () => {
  const deleteProvider = helpers.getDeleteProviderWithIdSet()
  const wrapper = mountComponentWithDeleteProvider(deleteProvider)
  commonAsserts.rendersAnAccessibleModal({ wrapper })
})

test('renders the confirmation text', () => {
  const deleteProvider = helpers.getDeleteProviderWithIdSet()
  const wrapper = mountComponentWithDeleteProvider(deleteProvider)
  const text = wrapper.findByText('p', FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.ARE_YOU_SURE)
  expect(text.exists()).toBe(true)
})

test('renders a cancel button to close the modal', async () => {
  const deleteProvider = helpers.getDeleteProviderWithIdSet()
  const wrapper = mountComponentWithDeleteProvider(deleteProvider)

  const cancelButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.CANCEL)
  await cancelButton.trigger('click')
  expect(deleteProvider.id).toBeUndefined()
})

describe('when clicking the delete button', () => {
  async function setUp(
    handler: HttpHandler = financeRecordHandlers.deleteFinanceRecordSuccess({
      id: financeRecordId,
    }),
  ) {
    testServer.use(handler)

    const deleteProvider = helpers.getDeleteProviderWithIdSet()
    const wrapper = mountComponentWithDeleteProvider(deleteProvider)

    const deleteButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.DELETE)
    await deleteButton.trigger('click')

    await flushPromises()

    return { deleteProvider, wrapper }
  }

  test('calls useDeleteFinanceRecord', async () => {
    const deleteSpy = vi.spyOn(deleteMutation, 'useDeleteFinanceRecord')
    await setUp()

    expect(deleteSpy).toHaveBeenCalledOnce()
  })

  test('closes the modal when the DELETE request is successful', async () => {
    const { deleteProvider } = await setUp()
    expect(deleteProvider.id).toBeUndefined()
  })

  test("does not close the modal when there's an error deleting the finance record", async () => {
    const { deleteProvider } = await setUp(
      financeRecordHandlers.deleteFinanceRecordError({ id: financeRecordId }),
    )
    expect(deleteProvider.id).toBe(financeRecordId)
  })
})
