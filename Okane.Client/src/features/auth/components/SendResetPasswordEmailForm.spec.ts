// External
import { http, HttpResponse } from 'msw'
import { flushPromises, type VueWrapper } from '@vue/test-utils'

import { type MockInstance } from 'vitest'

// Internal
import Heading from '@shared/components/Heading.vue'
import SendResetPasswordEmailForm from '@features/auth/components/SendResetPasswordEmailForm.vue'

import { authApiRoutes } from '@features/auth/constants/apiRoutes'
import { AUTH_COPY } from '@features/auth/constants/copy'
import { HTTP_STATUS_CODE } from '@shared/constants/http'

import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { getMswUrl } from '@tests/utils/url'
import { testServer } from '@tests/msw/testServer'

const mountComponent = getMountComponent(SendResetPasswordEmailForm, { withQueryClient: true })

const elements = {
  emailInput(wrapper: VueWrapper) {
    return wrapper.get('input[type="email"]')
  },
  submitButton(wrapper: VueWrapper) {
    return wrapper.get('button[type="submit"]')
  },
}

const sharedTests = {
  doesNotRenderAnError() {
    test('does not render an error', () => {
      const wrapper = mountComponent()
      const error = wrapper.findByText('p', AUTH_COPY.SEND_RESET_PASSWORD_EMAIL.ERROR)
      expect(error).toBeUndefined()
    })
  },
}

test('renders a heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.getComponent(Heading)
  expect(heading.text()).toBe(AUTH_COPY.SEND_RESET_PASSWORD_EMAIL.RESET_PASSWORD)
})

test('renders a paragraph', () => {
  const wrapper = mountComponent()
  const p = wrapper.findByText('p', AUTH_COPY.SEND_RESET_PASSWORD_EMAIL.ENTER_YOUR_EMAIL)
  expect(p).toBeDefined()
})

test('renders an email input', () => {
  const wrapper = mountComponent()
  const input = elements.emailInput(wrapper)
  expect(input.attributes('name')).toBe('email')
})

test('renders a submit button', () => {
  const wrapper = mountComponent()
  const button = elements.submitButton(wrapper)
  expect(button.text()).toBe(AUTH_COPY.SEND_RESET_PASSWORD_EMAIL.RESET_PASSWORD)
})

sharedTests.doesNotRenderAnError()

describe('when submitting the form', () => {
  async function setUp() {
    const wrapper = mountComponent()

    const email = 'sir-doggo@okane.com'
    const emailInput = elements.emailInput(wrapper)
    await emailInput.setValue(email)

    const submitButton = elements.submitButton(wrapper)
    await submitButton.trigger('submit')

    await flushPromises()

    return wrapper
  }

  describe('and email is sent successfully', () => {
    beforeEach(() => {
      const handler = http.post(
        getMswUrl(authApiRoutes.sendResetPasswordEmail()),
        () => new HttpResponse(null, { status: HTTP_STATUS_CODE.NO_CONTENT_204 }),
      )
      testServer.use(handler)
    })

    test('emits a success event', async () => {
      const wrapper = await setUp()
      expect(wrapper.emitted('success')).toBeDefined()
    })

    test('does not log an error', async () => {
      const spy = vi.spyOn(console, 'error')

      await setUp()

      expect(spy).not.toHaveBeenCalled()
    })

    sharedTests.doesNotRenderAnError()
  })

  describe('and email is not sent successfully', () => {
    const problemDetails = createTestProblemDetails({ detail: 'Failed to send email' })
    let consoleSpy: MockInstance

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const handler = http.post(getMswUrl(authApiRoutes.sendResetPasswordEmail()), () =>
        HttpResponse.json(problemDetails, { status: HTTP_STATUS_CODE.BAD_REQUEST_400 }),
      )
      testServer.use(handler)
    })

    test('does not emit a success event', async () => {
      const wrapper = await setUp()
      expect(wrapper.emitted('success')).toBeUndefined()
    })

    test('logs an error', async () => {
      await setUp()
      expect(consoleSpy).toHaveBeenCalledOnce()
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(String), problemDetails.detail)
    })

    test('renders an error', async () => {
      const wrapper = await setUp()
      const error = wrapper.findByText('p', AUTH_COPY.SEND_RESET_PASSWORD_EMAIL.ERROR)
      expect(error).toBeDefined()
    })
  })
})
