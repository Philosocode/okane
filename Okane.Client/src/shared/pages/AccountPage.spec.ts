// External
import { flushPromises, VueWrapper } from '@vue/test-utils'

// Internal
import AccountPage from '@shared/pages/AccountPage.vue'
import DeleteAccountModal from '@features/auth/components/accountPage/DeleteAccountModal.vue'
import EditName from '@features/auth/components/accountPage/EditName.vue'
import EditPassword from '@features/auth/components/accountPage/EditPassword.vue'
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { HTML_ROLE } from '@shared/constants/html'

import { authHandlers } from '@tests/msw/handlers/auth'
import { testServer } from '@tests/msw/testServer'

function mountComponent(
  passwordRequirementsHandler = authHandlers.getPasswordRequirementsSuccess(),
) {
  testServer.use(passwordRequirementsHandler)

  return getMountComponent(AccountPage, {
    global: {
      stubs: {
        teleport: true,
      },
    },
    withQueryClient: true,
    withRouter: true,
  })()
}

test('renders a heading', async () => {
  const wrapper = mountComponent()
  await flushPromises()
  const heading = wrapper.findByText('h1', AUTH_COPY.ACCOUNT_PAGE.HEADING)
  expect(heading).toBeDefined()
})

test('renders an EditName', async () => {
  const wrapper = mountComponent()
  await flushPromises()
  const component = wrapper.findComponent(EditName)
  expect(component.exists()).toBe(true)
})

test('renders an EditPassword', async () => {
  const wrapper = mountComponent()
  await flushPromises()
  const component = wrapper.findComponent(EditPassword)
  expect(component.exists()).toBe(true)
})

test('renders a divider', async () => {
  const wrapper = mountComponent()
  await flushPromises()
  const divider = wrapper.find(`div[role="${HTML_ROLE.SEPARATOR}"]`)
  expect(divider.exists()).toBe(true)
})

test('renders a DeleteAccountModal', async () => {
  const wrapper = mountComponent()
  await flushPromises()
  const component = wrapper.findComponent(DeleteAccountModal)
  expect(component.exists()).toBe(true)
})

test('does not render an error message', async () => {
  const wrapper = mountComponent()
  await flushPromises()
  const error = wrapper.findComponent(ErrorMessage)
  expect(error.exists()).toBe(false)
})

describe('while fetching password requirements', () => {
  test('does not render the page content', () => {
    const wrapper = mountComponent()
    // Assuming that if the EditName form isn't rendered, nothing else should be.
    expect(wrapper.findComponent(EditName).exists()).toBe(false)
  })
})

describe('with an error fetching password requirements', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent(authHandlers.getPasswordRequirementsError())
    await flushPromises()
  })

  test('does not render the page content', () => {
    // Assuming that if the EditName form isn't rendered, nothing else should be.
    expect(wrapper.findComponent(EditName).exists()).toBe(false)
  })

  test('renders an error message', () => {
    const error = wrapper.getComponent(ErrorMessage)
    expect(error.text()).toBe(AUTH_COPY.PASSWORD_REQUIREMENTS.FETCH_ERROR)
  })
})
