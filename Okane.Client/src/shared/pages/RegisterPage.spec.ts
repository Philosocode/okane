// External
import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import RegisterForm from '@features/auth/components/RegisterForm.vue'
import RegisterPage from '@shared/pages/RegisterPage.vue'
import SuccessfullyRegistered from '@features/auth/components/SuccessfullyRegistered.vue'

import { authHandlers } from '@tests/msw/handlers/auth'
import { testServer } from '@tests/msw/testServer'

const mountComponent = getMountComponent(RegisterPage, {
  global: {
    stubs: {
      RegisterForm: true,
    },
  },
  withQueryClient: true,
})

async function setUpWithPasswordRequirements({ shouldFlushPromises = true } = {}) {
  testServer.use(authHandlers.getPasswordRequirementsSuccess())

  const wrapper = mountComponent()

  if (shouldFlushPromises) await flushPromises()

  return wrapper
}

describe('while fetching password requirements', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = await setUpWithPasswordRequirements({ shouldFlushPromises: false })
  })

  test('does not render a RegisterForm', () => {
    expect(wrapper.findComponent(RegisterForm).exists()).toBe(false)
  })

  test('does not render a SuccessfullyRegistered component', () => {
    expect(wrapper.findComponent(SuccessfullyRegistered).exists()).toBe(false)
  })
})

test('renders a RegisterForm', async () => {
  const wrapper = await setUpWithPasswordRequirements()
  expect(wrapper.findComponent(RegisterForm).exists()).toBe(true)
})

test('does not render a SuccessfullyRegistered component', async () => {
  const wrapper = await setUpWithPasswordRequirements()
  expect(wrapper.findComponent(SuccessfullyRegistered).exists()).toBe(false)
})

describe('when the user successfully registers', () => {
  async function emitSucceeded(wrapper: VueWrapper) {
    wrapper.getComponent(RegisterForm).vm.$emit('success')
    await flushPromises()
  }

  test('does not render a RegisterForm', async () => {
    const wrapper = await setUpWithPasswordRequirements()
    await emitSucceeded(wrapper)
    expect(wrapper.findComponent(RegisterForm).exists()).toBe(false)
  })

  test('renders a SuccessfullyRegistered component', async () => {
    const wrapper = await setUpWithPasswordRequirements()
    await emitSucceeded(wrapper)
    expect(wrapper.findComponent(SuccessfullyRegistered).exists()).toBe(true)
  })
})
