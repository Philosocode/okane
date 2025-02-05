// External
import { http, HttpResponse } from 'msw'
import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import DeleteAccountModal from '@features/auth/components/DeleteAccountModal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

import { authApiRoutes } from '@features/auth/constants/apiRoutes'
import { AUTH_COPY } from '@features/auth/constants/copy'
import { HTTP_STATUS_CODE } from '@shared/constants/http'
import { SHARED_COPY } from '@shared/constants/copy'

import { createAppRouter, ROUTE_NAME } from '@shared/services/router/router'

import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { getMSWURL } from '@tests/utils/url'
import { testServer } from '@tests/msw/testServer'

const router = createAppRouter()
const mountComponent = getMountComponent(DeleteAccountModal, {
  global: {
    stubs: {
      teleport: true,
    },
  },
  withPinia: true,
  withQueryClient: true,
  withRouter: router,
})

const elements = {
  cancelButton(wrapper: VueWrapper) {
    return wrapper.findByText('button', SHARED_COPY.ACTIONS.CANCEL)
  },
  deleteButton(wrapper: VueWrapper) {
    return wrapper.findByText('button', SHARED_COPY.ACTIONS.DELETE, { isExact: true })
  },
  modalTrigger(wrapper: VueWrapper) {
    return wrapper.findByText('button', AUTH_COPY.ACCOUNT_PAGE.DELETE_ACCOUNT, { isExact: true })
  },
}

test('renders a button to open the modal', () => {
  const wrapper = mountComponent()
  const button = elements.modalTrigger(wrapper)
  expect(button).toBeDefined()
})

test('does not initially render the modal content', () => {
  const wrapper = mountComponent()
  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.exists()).toBe(false)
})

describe('when the modal is showing', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent({ attachTo: document.body })

    const modalTrigger = elements.modalTrigger(wrapper)
    await modalTrigger.trigger('click')
  })

  test('renders the heading', () => {
    const heading = wrapper.getComponent(ModalHeading)
    expect(heading.text()).toBe(AUTH_COPY.ACCOUNT_PAGE.DELETE_ACCOUNT)
  })

  test('renders the confirmation text', () => {
    const text = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.DELETE_ACCOUNT_CONFIRMATION)
    expect(text).toBeDefined()
  })

  test('renders a focused delete button', () => {
    const button = elements.deleteButton(wrapper)
    expect(button.element).toBe(document.activeElement)
  })

  test('renders a cancel button', () => {
    const button = elements.cancelButton(wrapper)
    expect(button).toBeDefined()
  })

  test('does not render an error', () => {
    const error = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.DELETE_ACCOUNT_ERROR)
    expect(error).toBeUndefined()
  })

  describe('when clicking the cancel button', () => {
    beforeEach(async () => {
      const button = elements.cancelButton(wrapper)
      await button.trigger('click')
    })

    test('closes the modal', () => {
      const heading = wrapper.findComponent(ModalHeading)
      expect(heading.exists()).toBe(false)
    })
  })

  describe('when account deletion succeeds', () => {
    beforeEach(async () => {
      const handler = http.delete(
        getMSWURL(authApiRoutes.self()),
        () => new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 }),
      )
      testServer.use(handler)

      const deleteButton = elements.deleteButton(wrapper)
      await deleteButton.trigger('click')
      await flushPromises()
    })

    test('redirects to the account deleted page', () => {
      expect(router.currentRoute.value.name).toBe(ROUTE_NAME.ACCOUNT_DELETED)
    })
  })

  describe('when account deletion fails', () => {
    beforeEach(async () => {
      const handler = http.delete(getMSWURL(authApiRoutes.self()), () =>
        HttpResponse.json(createTestProblemDetails(), {
          status: HTTP_STATUS_CODE.BAD_REQUEST_400,
        }),
      )
      testServer.use(handler)

      const deleteButton = elements.deleteButton(wrapper)
      await deleteButton.trigger('click')
      await flushPromises()
    })

    test('renders an error', () => {
      const error = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.DELETE_ACCOUNT_ERROR)
      expect(error).toBeDefined()
    })
  })
})
