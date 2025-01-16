// External
import { flushPromises } from '@vue/test-utils'

// Internal
import DeleteFinanceUserTagModal from '@features/financeUserTags/components/DeleteFinanceUserTagModal.vue'
import FinanceUserTagSummary from '@features/financeUserTags/components/FinanceUserTagSummary.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import {
  MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL,
  useManageFinanceUserTagsProvider,
} from '@features/financeUserTags/providers/manageFinanceUserTagsProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'
import { createTestProblemDetails } from '@tests/factories/problemDetails'

const spyOn = {
  delete() {
    return vi.spyOn(apiClient, 'delete')
  },
}
const userTagToDelete = createTestFinanceUserTag()

function mountWithProvider() {
  const provider = useManageFinanceUserTagsProvider()
  provider.setUserTagToDelete(userTagToDelete)

  const wrapper = getMountComponent(DeleteFinanceUserTagModal, {
    global: {
      provide: {
        [MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL]: provider,
      },
      stubs: {
        teleport: true,
      },
    },
    withQueryClient: true,
  })()

  return { provider, wrapper }
}

test('hides the modal content when userTagToDelete is not set', async () => {
  const { provider, wrapper } = mountWithProvider()
  provider.setUserTagToDelete(undefined)
  await flushPromises()

  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.exists()).toBe(false)
})

test('renders a heading', () => {
  const { wrapper } = mountWithProvider()
  const heading = wrapper.getComponent(ModalHeading)
  expect(heading.text()).toBe(FINANCE_USER_TAGS_COPY.DELETE_MODAL.HEADING)
})

test('renders confirmation text', () => {
  const { wrapper } = mountWithProvider()
  const text = wrapper.findByText('p', FINANCE_USER_TAGS_COPY.DELETE_MODAL.CONFIRMATION)
  expect(text).toBeDefined()
})

test('renders a summary of the user tag to delete', () => {
  const { wrapper } = mountWithProvider()
  const summary = wrapper.findComponent(FinanceUserTagSummary)
  expect(summary.exists()).toBe(true)
})

test('does not render an error', () => {
  const { wrapper } = mountWithProvider()
  const error = wrapper.findByText('p', FINANCE_USER_TAGS_COPY.DELETE_MODAL.ERROR)
  expect(error).toBeUndefined()
})

test('renders a button to close the modal', async () => {
  const { provider, wrapper } = mountWithProvider()
  const button = wrapper.findByText('button', SHARED_COPY.ACTIONS.CANCEL)

  await button.trigger('click')
  expect(provider.userTagToDelete).toBeUndefined()
})

test('renders a button to delete the user tag', async () => {
  const spy = spyOn.delete().mockResolvedValue()
  const { provider, wrapper } = mountWithProvider()
  const button = wrapper.findByText('button', SHARED_COPY.ACTIONS.DELETE)

  await button.trigger('click')
  await flushPromises()
  expect(provider.userTagToDelete).toBeUndefined()

  spy.mockRestore()
})

test('renders an error when deleting fails', async () => {
  const spy = spyOn.delete().mockRejectedValue(createTestProblemDetails())
  const { provider, wrapper } = mountWithProvider()
  const button = wrapper.findByText('button', SHARED_COPY.ACTIONS.DELETE)

  await button.trigger('click')
  await flushPromises()
  expect(provider.userTagToDelete).toEqual(userTagToDelete)

  const error = wrapper.findByText('p', FINANCE_USER_TAGS_COPY.DELETE_MODAL.ERROR)
  expect(error).toBeDefined()

  spy.mockRestore()
})
