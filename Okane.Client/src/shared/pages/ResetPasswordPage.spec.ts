// External
import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import ResetPasswordForm from '@features/auth/components/ResetPasswordForm.vue'
import ResetPasswordPage from '@shared/pages/ResetPasswordPage.vue'

import { authHandlers } from '@tests/msw/handlers/auth'
import { testServer } from '@tests/msw/testServer'
import { AUTH_COPY } from '@features/auth/constants/copy'

const mountComponent = getMountComponent(ResetPasswordPage, {
  withQueryClient: true,
  withRouter: true,
})

async function setUpWithPasswordRequirements({
  handler = authHandlers.getPasswordRequirementsSuccess(),
  shouldFlushPromises = true,
} = {}) {
  testServer.use(handler)

  const wrapper = mountComponent({
    global: {
      stubs: {
        ResetPasswordForm: true,
      },
    },
  })

  if (shouldFlushPromises) await flushPromises()

  return wrapper
}

test('renders a ResetPasswordForm', async () => {
  const wrapper = await setUpWithPasswordRequirements()
  expect(wrapper.findComponent(ResetPasswordForm).exists()).toBe(true)
})

test('does not render an error message', async () => {
  const wrapper = await setUpWithPasswordRequirements()
  expect(wrapper.findComponent(ErrorMessage).exists()).toBe(false)
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

describe('with an error fetching password requirements', () => {
  test('renders an error message', async () => {
    const wrapper = await setUpWithPasswordRequirements({
      handler: authHandlers.getPasswordRequirementsError(),
    })
    const error = wrapper.getComponent(ErrorMessage)
    expect(error.text()).toBe(AUTH_COPY.PASSWORD_REQUIREMENTS.FETCH_ERROR)
  })
})
