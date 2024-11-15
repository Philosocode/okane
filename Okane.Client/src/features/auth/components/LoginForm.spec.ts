// External
import { type MockInstance } from 'vitest'
import { type Router } from 'vue-router'
import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import LoginForm from '@features/auth/components/LoginForm.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'
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
}

const elements = {
  emailInput: (wrapper: VueWrapper) => wrapper.get('input[name="email"]'),
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

test('does not render an error message', () => {
  const wrapper = mountComponent()
  const error = wrapper.findByText('p', AUTH_COPY.AUTH_FORM.LOGIN_ERROR)
  expect(error).toBeUndefined()
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

    await flushPromises()
  })

  afterEach(() => {
    loginSpy.mockRestore()
  })

  test('makes a request to login', () => {
    expect(loginSpy).toHaveBeenCalledOnce()
    expect(loginSpy).toHaveBeenCalledWith(constants.email, constants.password)
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

  afterEach(() => {
    consoleSpy.mockRestore()
    loginSpy.mockRestore()
  })

  test('makes a request to login', () => {
    expect(loginSpy).toHaveBeenCalledOnce()
    expect(loginSpy).toHaveBeenCalledWith(constants.email, constants.password)
  })

  test('renders an error', () => {
    const error = wrapper.findByText('p', AUTH_COPY.AUTH_FORM.LOGIN_ERROR)
    expect(error).toBeDefined()
  })

  test('logs an error', () => {
    expect(consoleSpy).toHaveBeenCalledOnce()
  })

  test('does not redirect to the finances page', () => {
    expect(location.pathname).toBe(appRoutes.login.buildPath())
  })
})
