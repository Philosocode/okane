// External
import { http, HttpResponse } from 'msw'
import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'
import PasswordRequirements from '@features/auth/components/PasswordRequirements.vue'
import ResetPasswordForm from '@features/auth/components/ResetPasswordForm.vue'

import { authApiRoutes } from '@features/auth/constants/apiRoutes'
import { AUTH_COPY } from '@features/auth/constants/copy'
import { HTTP_STATUS_CODE } from '@shared/constants/http'
import { INPUT_TYPE } from '@shared/constants/form'
import { appRoutes, createAppRouter } from '@shared/services/router/router'

import { createTestPasswordRequirements } from '@tests/factories/passwordRequirements'
import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { getMSWURL } from '@tests/utils/url'
import { testServer } from '@tests/msw/testServer'

const requirements = createTestPasswordRequirements()

function getURL(queryString: string = '') {
  let url = appRoutes.resetPassword.buildPath()
  if (queryString) url += `?${queryString}`
  return url
}

async function mountComponent(
  url: string = getURL('email=coolEmail123@okane.com&token=coolToken'),
) {
  const router = createAppRouter()
  await router.push(url)

  return getMountComponent(ResetPasswordForm, {
    props: { requirements },
    withQueryClient: true,
    withRouter: router,
  })()
}

const asserts = {
  rendersAnInvalidURLError(wrapper: VueWrapper) {
    const error = wrapper.findByText('p', AUTH_COPY.RESET_PASSWORD.INVALID_URL)
    expect(error).toBeDefined()
  },
  doesNotRenderAnyErrors(wrapper: VueWrapper) {
    let error = wrapper.findByText('p', AUTH_COPY.RESET_PASSWORD.INVALID_URL)
    expect(error).toBeUndefined()

    error = wrapper.findByText('p', AUTH_COPY.RESET_PASSWORD.RESET_ERROR)
    expect(error).toBeUndefined()
  },
  doesNotRenderSuccessText(wrapper: VueWrapper) {
    const text = wrapper.findByText('p', AUTH_COPY.RESET_PASSWORD.RESET_SUCCEEDED.SUCCESS)
    expect(text).toBeUndefined()
  },
}

const elements = {
  passwordInput(wrapper: VueWrapper) {
    return wrapper.get(`input[name="password"]`)
  },
  passwordConfirmInput(wrapper: VueWrapper) {
    return wrapper.get(`input[name="passwordConfirm"]`)
  },
  submitButton(wrapper: VueWrapper) {
    return wrapper.get(`button[type="submit"]`)
  },
}

const validPassword = 'Aa1@'.repeat(requirements.minLength)

test('renders a heading', async () => {
  const wrapper = await mountComponent()
  const heading = wrapper.findByText('h1', AUTH_COPY.RESET_PASSWORD.HEADING)
  expect(heading).toBeDefined()
})

test('renders a password input', async () => {
  const wrapper = await mountComponent()
  const passwordInput = elements.passwordInput(wrapper)
  expect(passwordInput.attributes('type')).toBe(INPUT_TYPE.PASSWORD)
})

test('renders a password confirm input', async () => {
  const wrapper = await mountComponent()
  const passwordConfirmInput = elements.passwordConfirmInput(wrapper)
  expect(passwordConfirmInput.attributes('type')).toBe(INPUT_TYPE.PASSWORD)
})

test('renders password requirements', async () => {
  const wrapper = await mountComponent()
  const passwordRequirements = wrapper.findComponent(PasswordRequirements)
  expect(passwordRequirements.exists()).toBe(true)
})

test('renders a submit button', async () => {
  const wrapper = await mountComponent()
  const submitButton = elements.submitButton(wrapper)
  expect(submitButton.text()).toBe(AUTH_COPY.RESET_PASSWORD.SUBMIT_BUTTON)
  expect(submitButton.attributes('disabled')).toBeDefined()
})

test('does not render success text', async () => {
  const wrapper = await mountComponent()
  asserts.doesNotRenderSuccessText(wrapper)
})

test('does not render any errors', async () => {
  const wrapper = await mountComponent()
  asserts.doesNotRenderAnyErrors(wrapper)
})

test('disables the submit button and displays the requirements until form is valid', async () => {
  const wrapper = await mountComponent()
  const passwordRequirements = wrapper.findComponent(PasswordRequirements)
  const submitButton = elements.submitButton(wrapper)

  const invalidPassword = 'abc'

  const passwordInput = elements.passwordInput(wrapper)
  await passwordInput.setValue(invalidPassword)

  const passwordConfirmInput = elements.passwordConfirmInput(wrapper)
  await passwordConfirmInput.setValue(invalidPassword)
  expect(submitButton.attributes('disabled')).toBeDefined()
  expect(passwordRequirements.exists()).toBe(true)

  await passwordInput.setValue(validPassword)
  expect(submitButton.attributes('disabled')).toBeDefined()
  expect(passwordRequirements.exists()).toBe(true)

  await passwordConfirmInput.setValue(validPassword)
  expect(submitButton.attributes('disabled')).toBeUndefined()
  expect(passwordRequirements.exists()).toBe(false)
})

describe('when URL is missing an email', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = await mountComponent(getURL('token=coolToken'))
  })

  test('renders an invalid URL error', () => {
    asserts.rendersAnInvalidURLError(wrapper)
  })
})

describe('when URL is missing a token', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = await mountComponent(getURL('email=coolEmail@okane.com'))
  })

  test('renders an invalid URL error', () => {
    asserts.rendersAnInvalidURLError(wrapper)
  })
})

async function populateAndSubmitForm(wrapper: VueWrapper) {
  const passwordInput = elements.passwordInput(wrapper)
  await passwordInput.setValue(validPassword)

  const passwordConfirmInput = elements.passwordConfirmInput(wrapper)
  await passwordConfirmInput.setValue(validPassword)

  const submitButton = elements.submitButton(wrapper)
  await submitButton.trigger('submit')
}

describe('when password reset succeeds', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    const handler = http.post(getMSWURL(authApiRoutes.resetPassword()), () =>
      HttpResponse.json({}, { status: HTTP_STATUS_CODE.OK_200 }),
    )
    testServer.use(handler)

    wrapper = await mountComponent()
    await populateAndSubmitForm(wrapper)
    await flushPromises()
  })

  test('renders success text', () => {
    const text = wrapper.findByText('p', AUTH_COPY.RESET_PASSWORD.RESET_SUCCEEDED.SUCCESS)
    expect(text).toBeDefined()
  })

  test('renders a link to login', () => {
    const link = wrapper.findByText('a', AUTH_COPY.RESET_PASSWORD.RESET_SUCCEEDED.CLICK_HERE)
    expect(link).toBeDefined()
  })

  test('does not render the form', () => {
    const form = wrapper.findComponent(AuthForm)
    expect(form.exists()).toBe(false)
  })

  test('does not render any errors', () => {
    asserts.doesNotRenderAnyErrors(wrapper)
  })
})

describe('when password reset fails', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    const handler = http.post(getMSWURL(authApiRoutes.resetPassword()), () =>
      HttpResponse.json(createTestProblemDetails(), {
        status: HTTP_STATUS_CODE.BAD_REQUEST_400,
      }),
    )
    testServer.use(handler)

    wrapper = await mountComponent()
    await populateAndSubmitForm(wrapper)
    await flushPromises()
  })

  test('renders a reset error', () => {
    const error = wrapper.findByText('p', AUTH_COPY.RESET_PASSWORD.RESET_ERROR)
    expect(error).toBeDefined()
  })

  test('does not render success text', async () => {
    const wrapper = await mountComponent()
    asserts.doesNotRenderSuccessText(wrapper)
  })

  test('disables the submit button', () => {
    const submitButton = elements.submitButton(wrapper)
    expect(submitButton.attributes('disabled')).toBeDefined()
  })
})
