// External
import { flushPromises, type VueWrapper } from '@vue/test-utils'

import { type MockInstance } from 'vitest'

// Internal
import FinanceUserTagSummary from '@features/financeUserTags/components/FinanceUserTagSummary.vue'
import FormInput from '@shared/components/form/FormInput.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import RenameFinanceUserTagModal from '@features/financeUserTags/components/RenameFinanceUserTagModal.vue'

import { BUTTON_TYPE } from '@shared/constants/form'
import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'
import { SHARED_COPY } from '@shared/constants/copy'

import {
  MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL,
  useManageFinanceUserTagsProvider,
} from '@features/financeUserTags/providers/manageFinanceUserTagsProvider'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { createTestFinanceUserTag } from '@tests/factories/financeUserTag'
import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { createTestTag } from '@tests/factories/tag'
import { wrapInAPIResponse } from '@tests/utils/apiResponse'

const userTagToRename = createTestFinanceUserTag()
const renamedUserTag = createTestFinanceUserTag({
  id: 2,
  tag: createTestTag({ id: 2, name: '2-updated' }),
})

const spyOn = {
  put() {
    return vi.spyOn(apiClient, 'put')
  },
}

function mountWithProvider() {
  const provider = useManageFinanceUserTagsProvider()
  provider.setUserTagToRename(userTagToRename)

  const wrapper = getMountComponent(RenameFinanceUserTagModal, {
    attachTo: document.body,
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

test('hides the modal content when userTagToRename is not set', async () => {
  const { provider, wrapper } = mountWithProvider()
  provider.setUserTagToRename(undefined)
  await flushPromises()

  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.exists()).toBe(false)
})

test('renders a heading', () => {
  const { wrapper } = mountWithProvider()
  const heading = wrapper.getComponent(ModalHeading)
  expect(heading.text()).toBe(FINANCE_USER_TAGS_COPY.RENAME_MODAL.HEADING)
})

test('renders a summary of the user tag to rename', () => {
  const { wrapper } = mountWithProvider()
  const summary = wrapper.findComponent(FinanceUserTagSummary)
  expect(summary.exists()).toBe(true)
})

test('does not render an error', () => {
  const { wrapper } = mountWithProvider()
  const error = wrapper.findByText('p', FINANCE_USER_TAGS_COPY.RENAME_MODAL.ERROR)
  expect(error).toBeUndefined()
})

test('renders a button to close the modal', async () => {
  const { provider, wrapper } = mountWithProvider()
  const button = wrapper.findByText('button', SHARED_COPY.ACTIONS.CANCEL)

  await button.trigger('click')
  expect(provider.userTagToRename).toBeUndefined()
})

test('renders a focused input to rename the user tag', () => {
  const { wrapper } = mountWithProvider()
  const input = wrapper.getComponent(FormInput)
  expect(input).toBeDefined()
  expect(input.get('input').element).toBe(document.activeElement)

  const label = input.get('label')
  expect(label.text()).toBe(FINANCE_USER_TAGS_COPY.RENAME_MODAL.UPDATED_NAME)
})

test('renders a disabled button to rename the user tag', () => {
  const { wrapper } = mountWithProvider()
  const button = wrapper.findByText('button', SHARED_COPY.ACTIONS.RENAME)
  expect(button).toBeDefined()
  expect(button.attributes('disabled')).toBeDefined()
})

test('enables the submit button when input is populated', async () => {
  const { wrapper } = mountWithProvider()
  const input = wrapper.get('input')
  await input.setValue('A')
  const button = wrapper.findByText('button', SHARED_COPY.ACTIONS.RENAME)
  expect(button).toBeDefined()
  expect(button.attributes('disabled')).toBeUndefined()
})

test('disables the submit button when input value matches tag to rename', async () => {
  const { wrapper } = mountWithProvider()
  const input = wrapper.get('input')
  await input.setValue(userTagToRename.tag.name)
  const button = wrapper.findByText('button', SHARED_COPY.ACTIONS.RENAME)
  expect(button).toBeDefined()
  expect(button.attributes('disabled')).toBeDefined()
})

describe('when submitting the form', () => {
  let putSpy: MockInstance

  beforeEach(() => {
    putSpy = spyOn.put().mockResolvedValue(wrapInAPIResponse(userTagToRename))
  })

  async function submitForm(wrapper: VueWrapper) {
    const input = wrapper.get('input')
    await input.setValue(renamedUserTag.tag.name)

    const button = wrapper.get(`button[type="${BUTTON_TYPE.SUBMIT}"]`)
    await button.trigger('submit')
  }

  test('disables the submit button while the request is pending', async () => {
    const { wrapper } = mountWithProvider()

    await submitForm(wrapper)
    const button = wrapper.get(`button[type="${BUTTON_TYPE.SUBMIT}"]`)
    expect(button.attributes('disabled')).toBeDefined()
  })

  test('closes the modal after successful rename', async () => {
    const { provider, wrapper } = mountWithProvider()

    await submitForm(wrapper)
    await flushPromises()
    expect(provider.userTagToRename).toBeUndefined()
  })

  test('renders an error when renaming fails', async () => {
    putSpy.mockRejectedValue(createTestProblemDetails())
    const { provider, wrapper } = mountWithProvider()

    await submitForm(wrapper)
    await flushPromises()
    expect(provider.userTagToRename).toEqual(userTagToRename)

    const error = wrapper.findByText('p', FINANCE_USER_TAGS_COPY.RENAME_MODAL.ERROR)
    expect(error).toBeDefined()
  })
})
