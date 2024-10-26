// External
import { beforeEach } from 'vitest'
import { flushPromises, VueWrapper } from '@vue/test-utils'

// Internal
import RegisterForm from '@features/auth/components/RegisterForm.vue'
import RegisterPage from '@shared/pages/RegisterPage.vue'
import SuccessfullyRegistered from '@features/auth/components/SuccessfullyRegistered.vue'

const mountComponent = getMountComponent(RegisterPage, {
  global: {
    stubs: {
      RegisterForm: true,
    },
  },
})

test('renders a RegisterForm', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(RegisterForm).exists()).toBe(true)
})

test('does not render a SuccessfullyRegistered component', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(SuccessfullyRegistered).exists()).toBe(false)
})

describe('when the user successfully registers', () => {
  async function emitSucceeded(wrapper: VueWrapper) {
    wrapper.getComponent(RegisterForm).vm.$emit('succeeded')
    await flushPromises()
  }

  test('does not render a RegisterForm', async () => {
    const wrapper = mountComponent()
    await emitSucceeded(wrapper)
    expect(wrapper.findComponent(RegisterForm).exists()).toBe(false)
  })

  test('renders a SuccessfullyRegistered component', async () => {
    const wrapper = mountComponent()
    await emitSucceeded(wrapper)
    expect(wrapper.findComponent(SuccessfullyRegistered).exists()).toBe(true)
  })
})
