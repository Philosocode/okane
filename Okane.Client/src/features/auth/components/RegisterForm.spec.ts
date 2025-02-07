// External
import { type MockInstance } from 'vitest'
import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import RegisterForm from '@features/auth/components/RegisterForm.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { HONEYPOT_INPUT_NAME, INPUT_TYPE } from '@shared/constants/form'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { createTestPasswordRequirements } from '@tests/factories/passwordRequirements'
import { useMockedStore } from '@tests/composables/useMockedStore'

const passwordRequirements = createTestPasswordRequirements()

const mountComponent = getMountComponent(RegisterForm, {
  props: { passwordRequirements },
  withPinia: true,
})

const constants = {
  email: 'sir-doggo@okane.com',
  name: 'Sir Doggo',
  password: 'coolPassword1234@@@@@',
  [HONEYPOT_INPUT_NAME]: 'I am robot',
}

const elements = {
  emailInput: (wrapper: VueWrapper) => wrapper.get('input[name="email"]'),
  honeypotInput: (wrapper: VueWrapper) => wrapper.get(`input[name="${HONEYPOT_INPUT_NAME}"]`),
  nameInput: (wrapper: VueWrapper) => wrapper.get('input[name="name"]'),
  passwordInput: (wrapper: VueWrapper) => wrapper.get('input[name="password"]'),
  passwordConfirmInput: (wrapper: VueWrapper) => wrapper.get('input[name="passwordConfirm"]'),
  submitButton: (wrapper: VueWrapper) => wrapper.get('button[type="submit"]'),
}

const spyOn = {
  authStoreRegister() {
    const authStore = useMockedStore(useAuthStore)
    return vi.spyOn(authStore, 'register')
  },
  consoleError() {
    return vi.spyOn(console, 'error')
  },
}

test('renders a register heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.findByText('h1', AUTH_COPY.AUTH_FORM.REGISTER)
  expect(heading).toBeDefined()
})

test('renders an email input', () => {
  const wrapper = mountComponent()
  const input = elements.emailInput(wrapper)
  expect(input.attributes('type')).toBe(INPUT_TYPE.EMAIL)
})

test('renders a name input', () => {
  const wrapper = mountComponent()
  const input = elements.nameInput(wrapper)
  expect(input.attributes('type')).toBe(INPUT_TYPE.TEXT)
})

test('renders a password input', () => {
  const wrapper = mountComponent()
  const input = elements.passwordInput(wrapper)
  expect(input.attributes('type')).toBe(INPUT_TYPE.PASSWORD)
})

test('renders a password confirm input', () => {
  const wrapper = mountComponent()
  const input = elements.passwordConfirmInput(wrapper)
  expect(input.attributes('type')).toBe(INPUT_TYPE.PASSWORD)
})

test('renders a honeypot input', () => {
  const wrapper = mountComponent()
  const input = elements.honeypotInput(wrapper)
  expect(input.attributes('name')).toBe(HONEYPOT_INPUT_NAME)
})

test('does not render an error message', () => {
  const wrapper = mountComponent()
  const error = wrapper.findByText('p', AUTH_COPY.AUTH_FORM.ERRORS.REGISTER)
  expect(error).toBeUndefined()
})

test('disables the submit button until all inputs are filled out', async () => {
  const wrapper = mountComponent()
  const submitButton = elements.submitButton(wrapper)
  expect(submitButton.attributes('disabled')).toBeDefined()

  const emailInput = elements.emailInput(wrapper)
  await emailInput.setValue(constants.email)
  expect(submitButton.attributes('disabled')).toBeDefined()

  const nameInput = elements.nameInput(wrapper)
  await nameInput.setValue(constants.name)
  expect(submitButton.attributes('disabled')).toBeDefined()

  const passwordInput = elements.passwordInput(wrapper)
  await passwordInput.setValue(constants.password)
  expect(submitButton.attributes('disabled')).toBeDefined()

  const passwordConfirmInput = elements.passwordConfirmInput(wrapper)
  await passwordConfirmInput.setValue(constants.password)
  expect(submitButton.attributes('disabled')).toBeUndefined()
})

async function populateInputs(wrapper: VueWrapper) {
  const emailInput = elements.emailInput(wrapper)
  await emailInput.setValue(constants.email)

  const nameInput = elements.nameInput(wrapper)
  await nameInput.setValue(constants.name)

  const passwordInput = elements.passwordInput(wrapper)
  await passwordInput.setValue(constants.password)

  const passwordConfirmInput = elements.passwordConfirmInput(wrapper)
  await passwordConfirmInput.setValue(constants.password)

  const honeypotInput = elements.honeypotInput(wrapper)
  await honeypotInput.setValue(constants[HONEYPOT_INPUT_NAME])
}

test('disables the submit button with an invalid password', async () => {
  const wrapper = mountComponent()
  await populateInputs(wrapper)

  const invalidPassword = 'tooShort123@'

  const passwordInput = elements.passwordInput(wrapper)
  await passwordInput.setValue(invalidPassword)

  const passwordConfirmInput = elements.passwordConfirmInput(wrapper)
  await passwordConfirmInput.setValue(invalidPassword)

  const submitButton = elements.submitButton(wrapper)
  expect(submitButton.attributes('disabled')).toBeUndefined()
})

describe('when successfully registering', () => {
  let registerSpy: MockInstance
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent()
    registerSpy = spyOn.authStoreRegister().mockResolvedValue()
    await populateInputs(wrapper)

    const submitButton = elements.submitButton(wrapper)
    await submitButton.trigger('submit')

    await flushPromises()
  })

  test('makes a request to register', () => {
    expect(registerSpy).toHaveBeenCalledOnce()
    expect(registerSpy).toHaveBeenCalledWith(constants)
  })

  test('emits a success event', () => {
    expect(wrapper.emitted('success')).toBeDefined()
  })
})

describe('with an error registering', () => {
  let consoleSpy: MockInstance
  let registerSpy: MockInstance
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent()
    consoleSpy = spyOn.consoleError().mockImplementation(() => {})
    registerSpy = spyOn
      .authStoreRegister()
      .mockImplementation(() => Promise.reject('Error registering'))
    await populateInputs(wrapper)

    const submitButton = elements.submitButton(wrapper)
    await submitButton.trigger('submit')

    await flushPromises()
  })

  test('makes a request to register', () => {
    expect(registerSpy).toHaveBeenCalledOnce()
    expect(registerSpy).toHaveBeenCalledWith({
      email: constants.email,
      name: constants.name,
      password: constants.password,
      [HONEYPOT_INPUT_NAME]: constants[HONEYPOT_INPUT_NAME],
    })
  })

  test('renders an error', () => {
    const error = wrapper.findByText('p', AUTH_COPY.AUTH_FORM.ERRORS.REGISTER)
    expect(error).toBeDefined()
  })

  test('logs an error', () => {
    expect(consoleSpy).toHaveBeenCalledOnce()
  })

  test('does not emit a success event', () => {
    expect(wrapper.emitted('success')).toBeUndefined()
  })
})
