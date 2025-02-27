// External
import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import VerifyEmailFailed from '@features/auth/components/verifyEmail/VerifyEmailFailed.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import { apiClient } from '@shared/services/apiClient/apiClient'
import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { wrapInApiResponse } from '@tests/utils/apiResponse'

const email = 'sir-doggo@okane.com'
const mountComponent = getMountComponent(VerifyEmailFailed, {
  props: { email },
  withQueryClient: true,
  withRouter: true,
})

test('renders the "verification failed" text', () => {
  const wrapper = mountComponent()
  let text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.VERIFICATION_FAILED.FAILED)
  expect(text).toBeDefined()

  text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.VERIFICATION_FAILED.RESEND)
  expect(text).toBeDefined()
})

test('does not render the "email sent successfully" text', () => {
  const wrapper = mountComponent()
  const text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.RE_SEND_VERIFICATION_EMAIL.SUCCESS)
  expect(text).toBeUndefined()
})

test('renders a button to re-send the verification email', () => {
  const wrapper = mountComponent()
  const button = wrapper.get('button')
  expect(button.text()).toBe(AUTH_COPY.VERIFY_EMAIL.VERIFICATION_FAILED.CLICK_HERE)
})

test('does not render the error text', () => {
  const wrapper = mountComponent()
  const text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.RE_SEND_VERIFICATION_EMAIL.ERROR)
  expect(text).toBeUndefined()
})

describe('when successfully re-sending the verification email', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent()
    vi.spyOn(apiClient, 'post').mockResolvedValue(wrapInApiResponse('success'))

    const button = wrapper.find('button')
    await button.trigger('click')

    await flushPromises()
  })

  test('renders the "email sent successfully" text', () => {
    const text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.RE_SEND_VERIFICATION_EMAIL.SUCCESS)
    expect(text).toBeDefined()
  })

  test('does not render the "verification failed" text', () => {
    let text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.VERIFICATION_FAILED.FAILED)
    expect(text).toBeUndefined()

    text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.VERIFICATION_FAILED.RESEND)
    expect(text).toBeUndefined()
  })

  test('hides the button to re-send an email', () => {
    const button = wrapper.find('button')
    expect(button.exists()).toBe(false)
  })

  test('does not render the error text', () => {
    const wrapper = mountComponent()
    const text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.RE_SEND_VERIFICATION_EMAIL.ERROR)
    expect(text).toBeUndefined()
  })
})

describe('with an error re-sending the verification email', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(createTestProblemDetails())
    wrapper = mountComponent()

    const button = wrapper.find('button')
    await button.trigger('click')

    await flushPromises()
  })

  test('renders the error text', () => {
    const text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.RE_SEND_VERIFICATION_EMAIL.ERROR)
    expect(text).toBeDefined()
  })

  test('does not render the "email sent successfully" text', () => {
    const text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.RE_SEND_VERIFICATION_EMAIL.SUCCESS)
    expect(text).toBeUndefined()
  })

  test('does not render the "verification failed" text', () => {
    let text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.VERIFICATION_FAILED.FAILED)
    expect(text).toBeUndefined()

    text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.VERIFICATION_FAILED.RESEND)
    expect(text).toBeUndefined()
  })

  test('does not render the button to re-send an email', () => {
    const button = wrapper.find('button')
    expect(button.exists()).toBe(false)
  })
})
