// External
import { flushPromises, VueWrapper } from '@vue/test-utils'

// Internal
import ResetPasswordForm from '@features/auth/components/ResetPasswordForm.vue'
import ResetPasswordPage from '@shared/pages/ResetPasswordPage.vue'

import { authHandlers } from '@tests/msw/handlers/auth'
import { testServer } from '@tests/msw/testServer'

const mountComponent = getMountComponent(ResetPasswordPage, {
  withQueryClient: true,
  withRouter: true,
})

async function setUpWithPasswordRequirements({ shouldFlushPromises = true } = {}) {
  testServer.use(authHandlers.getPasswordRequirementsSuccess())

  const wrapper = mountComponent()

  if (shouldFlushPromises) await flushPromises()

  return wrapper
}

test('renders a ResetPasswordForm', async () => {
  const wrapper = await setUpWithPasswordRequirements()
  expect(wrapper.findComponent(ResetPasswordForm).exists()).toBe(true)
})

describe('while fetching password requirements', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = await setUpWithPasswordRequirements({ shouldFlushPromises: false })
  })

  test('does not render a RegisterForm', () => {
    expect(wrapper.findComponent(ResetPasswordForm).exists()).toBe(false)
  })
})
