// External
import { flushPromises, type VueWrapper } from '@vue/test-utils'

import { type HttpHandler } from 'msw'

// Internal
import DeleteFinanceRecordModal from '@features/financeRecords/components/saveFinanceRecord/DeleteFinanceRecordModal.vue'
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import FinanceRecordSummary from '@features/financeRecords/components/FinanceRecordSummary.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import {
  DELETE_FINANCE_RECORD_SYMBOL,
  type DeleteFinanceRecordProvider,
  useDeleteFinanceRecordProvider,
} from '@features/financeRecords/providers/deleteFinanceRecordProvider'
import {
  FINANCE_RECORD_SEARCH_FILTERS_SYMBOL,
  useFinanceRecordSearchFiltersProvider,
} from '@features/financeRecords/providers/financeRecordSearchFiltersProvider'

import * as deleteMutation from '@features/financeRecords/composables/useDeleteFinanceRecord'

import { commonAsserts } from '@tests/utils/commonAsserts'
import { createTestFinanceRecord } from '@tests/factories/financeRecord'
import { financeRecordHandlers } from '@tests/msw/handlers/financeRecord'
import { testServer } from '@tests/msw/testServer'

const financeRecord = createTestFinanceRecord()
const mountComponent = getMountComponent(DeleteFinanceRecordModal, {
  attachTo: document.body,
  global: {
    provide: {
      [DELETE_FINANCE_RECORD_SYMBOL]: useDeleteFinanceRecordProvider(),
      [FINANCE_RECORD_SEARCH_FILTERS_SYMBOL]: useFinanceRecordSearchFiltersProvider(),
    },
    stubs: {
      teleport: true,
    },
  },
  withQueryClient: true,
})

const helpers = {
  getPopulatedDeleteProvider() {
    const deleteProvider = useDeleteFinanceRecordProvider()

    deleteProvider.setFinanceRecordToDelete(financeRecord)

    return deleteProvider
  },
}

function mountComponentWithDeleteProvider(provider: DeleteFinanceRecordProvider) {
  return mountComponent({
    global: {
      provide: {
        [DELETE_FINANCE_RECORD_SYMBOL]: provider,
      },
    },
  })
}

test('does not render the modal content when the finance record ID is empty', () => {
  const wrapper = mountComponentWithDeleteProvider(useDeleteFinanceRecordProvider())
  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.exists()).toBe(false)
})

test('renders the modal heading', () => {
  const deleteProvider = helpers.getPopulatedDeleteProvider()
  const wrapper = mountComponentWithDeleteProvider(deleteProvider)
  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.text()).toBe(FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.DELETE_FINANCE_RECORD)
})

test('renders an accessible modal', () => {
  const deleteProvider = helpers.getPopulatedDeleteProvider()
  const wrapper = mountComponentWithDeleteProvider(deleteProvider)
  commonAsserts.rendersAnAccessibleModal({ wrapper })
})

test('renders the confirmation text', () => {
  const deleteProvider = helpers.getPopulatedDeleteProvider()
  const wrapper = mountComponentWithDeleteProvider(deleteProvider)
  const text = wrapper.findByText('p', FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.CONFIRMATION_TEXT)
  expect(text.exists()).toBe(true)
})

test('renders a summary of the finance record to delete', () => {
  const deleteProvider = helpers.getPopulatedDeleteProvider()
  const wrapper = mountComponentWithDeleteProvider(deleteProvider)
  const summary = wrapper.findComponent(FinanceRecordSummary)
  expect(summary.exists()).toBe(true)
})

test('renders a focused delete button', () => {
  const deleteProvider = helpers.getPopulatedDeleteProvider()
  const wrapper = mountComponentWithDeleteProvider(deleteProvider)
  const deleteButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.DELETE)
  expect(deleteButton.element).toBe(document.activeElement)
  expect(deleteButton.attributes('disabled')).toBeUndefined()
})

test('renders a cancel button to close the modal', async () => {
  const deleteProvider = helpers.getPopulatedDeleteProvider()
  const wrapper = mountComponentWithDeleteProvider(deleteProvider)

  const cancelButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.CANCEL)
  await cancelButton.trigger('click')
  expect(deleteProvider.financeRecordToDelete).toBeUndefined()
})

test('does not render an error message', () => {
  const deleteProvider = helpers.getPopulatedDeleteProvider()
  const wrapper = mountComponentWithDeleteProvider(deleteProvider)
  expect(wrapper.findComponent(ErrorMessage).exists()).toBe(false)
})

describe('when clicking the delete button', () => {
  async function setUp(
    handler: HttpHandler = financeRecordHandlers.deleteFinanceRecordSuccess({
      id: financeRecord.id,
    }),
  ) {
    testServer.use(handler)

    const deleteProvider = helpers.getPopulatedDeleteProvider()
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
    expect(deleteProvider.financeRecordToDelete).toBeUndefined()
  })

  describe('with an error deleting the finance record', () => {
    let deleteProvider: DeleteFinanceRecordProvider
    let wrapper: VueWrapper

    beforeEach(async () => {
      const setUpResult = await setUp(
        financeRecordHandlers.deleteFinanceRecordError({ id: financeRecord.id }),
      )

      deleteProvider = setUpResult.deleteProvider
      wrapper = setUpResult.wrapper
    })

    test('does not close the modal', () => {
      expect(deleteProvider.financeRecordToDelete).toEqual(financeRecord)
    })

    test('disables the delete button', () => {
      const button = wrapper.findByText('button', SHARED_COPY.ACTIONS.DELETE)
      expect(button.attributes('disabled')).toBeDefined()
    })

    test('renders an error message', () => {
      const error = wrapper.getComponent(ErrorMessage)
      expect(error.text()).toBe(FINANCES_COPY.DELETE_FINANCE_RECORD_MODAL.ERROR)
    })
  })
})
