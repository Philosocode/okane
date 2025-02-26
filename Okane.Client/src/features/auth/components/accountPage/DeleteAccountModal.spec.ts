// External
import { http, type HttpHandler, HttpResponse } from 'msw'
import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import DeleteAccountModal from '@features/auth/components/accountPage/DeleteAccountModal.vue'
import ModalHeading from '@shared/components/modal/ModalHeading.vue'

import { authApiRoutes } from '@features/auth/constants/apiRoutes'
import { AUTH_COPY } from '@features/auth/constants/copy'
import { HTTP_STATUS_CODE } from '@shared/constants/http'
import { SHARED_COPY } from '@shared/constants/copy'

import { createAppRouter, ROUTE_NAME } from '@shared/services/router/router'

import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { getMswUrl } from '@tests/utils/url'
import { testServer } from '@tests/msw/testServer'

async function mountComponent(router = createAppRouter()) {
  const wrapper = getMountComponent(DeleteAccountModal, {
    attachTo: document.body,
    global: {
      stubs: {
        teleport: true,
      },
    },
    withPinia: true,
    withQueryClient: true,
    withRouter: router,
  })()

  const modalTrigger = elements.modalTrigger(wrapper)
  await modalTrigger.trigger('click')

  return wrapper
}

const elements = {
  cancelButton(wrapper: VueWrapper) {
    return wrapper.findByText('button', SHARED_COPY.ACTIONS.CANCEL)
  },
  deleteButton(wrapper: VueWrapper) {
    return wrapper.findByText('button', SHARED_COPY.ACTIONS.DELETE, { isExact: true })
  },
  modalTrigger(wrapper: VueWrapper) {
    return wrapper.findByText('button', AUTH_COPY.DELETE_ACCOUNT.HEADING, { isExact: true })
  },
}

test('renders the heading', async () => {
  const wrapper = await mountComponent()
  const heading = wrapper.getComponent(ModalHeading)
  expect(heading.text()).toBe(AUTH_COPY.DELETE_ACCOUNT.HEADING)
})

test('renders the confirmation text', async () => {
  const wrapper = await mountComponent()
  const text = wrapper.findByText('p', AUTH_COPY.DELETE_ACCOUNT.CONFIRMATION)
  expect(text).toBeDefined()
})

test('renders a focused delete button', async () => {
  const wrapper = await mountComponent()
  const button = elements.deleteButton(wrapper)
  expect(button.element).toBe(document.activeElement)
})

test('renders a cancel button', async () => {
  const wrapper = await mountComponent()
  const button = elements.cancelButton(wrapper)
  expect(button).toBeDefined()
})

test('does not render an error', async () => {
  const wrapper = await mountComponent()
  const error = wrapper.findByText('p', AUTH_COPY.DELETE_ACCOUNT.ERROR)
  expect(error).toBeUndefined()
})

describe('when clicking the cancel button', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = await mountComponent()

    const button = elements.cancelButton(wrapper)
    await button.trigger('click')
  })

  test('closes the modal', () => {
    const heading = wrapper.findComponent(ModalHeading)
    expect(heading.exists()).toBe(false)
  })

  test('renders a button to open the modal', () => {
    const button = elements.modalTrigger(wrapper)
    expect(button).toBeDefined()
  })

  test('does not render the modal content', () => {
    const heading = wrapper.findComponent(ModalHeading)
    expect(heading.exists()).toBe(false)
  })
})

async function setUpDeleteAttempt(handler: HttpHandler) {
  const router = createAppRouter()
  const goSpy = vi.spyOn(router, 'go').mockImplementation(() => {})
  const pushSpy = vi.spyOn(router, 'push')
  testServer.use(handler)

  const wrapper = await mountComponent(router)

  const deleteButton = elements.deleteButton(wrapper)
  await deleteButton.trigger('click')
  await flushPromises()
  await vi.dynamicImportSettled()

  return { goSpy, pushSpy, wrapper }
}

describe('when account deletion fails', () => {
  const handler = http.delete(getMswUrl(authApiRoutes.self()), () =>
    HttpResponse.json(createTestProblemDetails(), {
      status: HTTP_STATUS_CODE.BAD_REQUEST_400,
    }),
  )

  test('renders an error', async () => {
    const { wrapper } = await setUpDeleteAttempt(handler)
    const error = wrapper.findByText('p', AUTH_COPY.DELETE_ACCOUNT.ERROR)
    expect(error).toBeDefined()
  })

  test('does not redirect to the success page', async () => {
    const { pushSpy } = await setUpDeleteAttempt(handler)
    expect(pushSpy).not.toHaveBeenCalledWith({ name: ROUTE_NAME.ACCOUNT_DELETED })
  })

  test('does not refresh the page', async () => {
    const { goSpy } = await setUpDeleteAttempt(handler)
    expect(goSpy).not.toHaveBeenCalled()
  })
})

describe('when account deletion succeeds', () => {
  const handler = http.delete(
    getMswUrl(authApiRoutes.self()),
    () => new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 }),
  )

  test('redirects to the account deleted page', async () => {
    const { pushSpy } = await setUpDeleteAttempt(handler)
    expect(pushSpy).toHaveBeenCalledOnce()
    expect(pushSpy).toHaveBeenCalledWith({ name: ROUTE_NAME.ACCOUNT_DELETED })
  })

  test('refreshes the page', async () => {
    const { goSpy } = await setUpDeleteAttempt(handler)
    expect(goSpy).toHaveBeenCalledOnce()
    expect(goSpy).toHaveBeenCalledWith(0)
  })
})
