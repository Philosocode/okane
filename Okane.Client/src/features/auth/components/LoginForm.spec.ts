// External
import { type MockInstance } from 'vitest'
import { type Router } from 'vue-router'
import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import LoginForm from '@features/auth/components/LoginForm.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { HONEYPOT_INPUT_NAME, INPUT_TYPE } from '@shared/constants/form'
import { appRoutes, createAppRouter } from '@shared/services/router/router'

import { useAuthStore } from '@features/auth/composables/useAuthStore'
import { useMockedStore } from '@tests/composables/useMockedStore'

function mountComponent(args: { router?: Router } = {}) {
  return getMountComponent(LoginForm, {
    withPinia: true,
    withRouter: args.router ?? true,
  })()
}

const constants = {
  email: 'hi@hi.com',
  password: 'coolPassword',
  [HONEYPOT_INPUT_NAME]: 'I am not a bot',
}

const elements = {
  emailInput: (wrapper: VueWrapper) => wrapper.get('input[name="email"]'),
  honeypotInput: (wrapper: VueWrapper) => wrapper.get(`input[name="${HONEYPOT_INPUT_NAME}"]`),
  passwordInput: (wrapper: VueWrapper) => wrapper.get('input[name="password"]'),
  submitButton: (wrapper: VueWrapper) => wrapper.get('button[type="submit"]'),
}

const spyOn = {
  authStoreLogin() {
    const authStore = useMockedStore(useAuthStore)
    return vi.spyOn(authStore, 'login')
  },
  consoleError() {
    return vi.spyOn(console, 'error')
  },
}

test('renders a login heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.findByText('h1', AUTH_COPY.AUTH_FORM.LOGIN)
  expect(heading).toBeDefined()
})

test('renders an email input', () => {
  const wrapper = mountComponent()
  const input = elements.emailInput(wrapper)
  expect(input.attributes('type')).toBe(INPUT_TYPE.EMAIL)
})

test('renders a password input', () => {
  const wrapper = mountComponent()
  const input = elements.passwordInput(wrapper)
  expect(input.attributes('type')).toBe(INPUT_TYPE.PASSWORD)
})

test('renders a honeypot input', () => {
  const wrapper = mountComponent()
  const input = elements.honeypotInput(wrapper)
  expect(input.attributes('name')).toBe(HONEYPOT_INPUT_NAME)
})

test('does not render an error message', () => {
  const wrapper = mountComponent()
  const error = wrapper.findByText('p', AUTH_COPY.AUTH_FORM.ERRORS.LOGIN)
  expect(error).toBeUndefined()
})

test('renders a "forgot password" link', () => {
  const wrapper = mountComponent()
  const link = wrapper.findByText('a', AUTH_COPY.FORGOT_PASSWORD)
  expect(link.attributes('href')).toBe(appRoutes.sendResetPasswordEmail.buildPath())
})

test('disables the submit button until all inputs are filled out', async () => {
  const wrapper = mountComponent()
  const submitButton = elements.submitButton(wrapper)
  expect(submitButton.attributes('disabled')).toBeDefined()

  const emailInput = elements.emailInput(wrapper)
  await emailInput.setValue(constants.email)

  expect(submitButton.attributes('disabled')).toBeDefined()

  const passwordInput = elements.passwordInput(wrapper)
  await passwordInput.setValue(constants.password)

  expect(submitButton.attributes('disabled')).toBeUndefined()
})

async function populateInputs(wrapper: VueWrapper) {
  const emailInput = elements.emailInput(wrapper)
  await emailInput.setValue(constants.email)

  const passwordInput = elements.passwordInput(wrapper)
  await passwordInput.setValue(constants.password)

  const honeypotInput = elements.honeypotInput(wrapper)
  await honeypotInput.setValue(constants[HONEYPOT_INPUT_NAME])
}

describe('when successfully logging in', () => {
  let loginSpy: MockInstance
  let router: Router
  let wrapper: VueWrapper

  beforeEach(async () => {
    router = createAppRouter()
    await router.push(appRoutes.login.buildPath())

    wrapper = mountComponent({ router })
    loginSpy = spyOn.authStoreLogin().mockResolvedValue()
    await populateInputs(wrapper)

    const submitButton = elements.submitButton(wrapper)
    await submitButton.trigger('submit')

    await vi.dynamicImportSettled()
    await flushPromises()
  })

  test('makes a request to login', () => {
    expect(loginSpy).toHaveBeenCalledOnce()
    expect(loginSpy).toHaveBeenCalledWith({
      email: constants.email,
      password: constants.password,
      [HONEYPOT_INPUT_NAME]: constants[HONEYPOT_INPUT_NAME],
    })
  })

  test('redirects to the finances page', () => {
    expect(location.pathname).toBe(appRoutes.finances.buildPath())
  })
})

describe('with an error logging in', () => {
  let consoleSpy: MockInstance
  let loginSpy: MockInstance
  let router: Router
  let wrapper: VueWrapper

  beforeEach(async () => {
    router = createAppRouter()
    await router.push(appRoutes.login.buildPath())

    wrapper = mountComponent({ router })
    consoleSpy = spyOn.consoleError().mockImplementation(() => {})
    loginSpy = spyOn.authStoreLogin().mockImplementation(() => Promise.reject('Error logging in'))
    await populateInputs(wrapper)

    const submitButton = elements.submitButton(wrapper)
    await submitButton.trigger('submit')

    await flushPromises()
  })

  test('makes a request to login', () => {
    expect(loginSpy).toHaveBeenCalledOnce()
    expect(loginSpy).toHaveBeenCalledWith({
      email: constants.email,
      password: constants.password,
      [HONEYPOT_INPUT_NAME]: constants[HONEYPOT_INPUT_NAME],
    })
  })

  test('renders an error', () => {
    const error = wrapper.findByText('p', AUTH_COPY.AUTH_FORM.ERRORS.LOGIN)
    expect(error).toBeDefined()
  })

  test('logs an error', () => {
    expect(consoleSpy).toHaveBeenCalledOnce()
  })

  test('does not redirect to the finances page', () => {
    expect(location.pathname).toBe(appRoutes.login.buildPath())
  })
})
