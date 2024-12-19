// External
import { flushPromises } from '@vue/test-utils'

// Internal
import AccountPage from '@shared/pages/AccountPage.vue'
import DeleteAccountModal from '@features/auth/components/DeleteAccountModal.vue'
import EditName from '@features/auth/components/EditName.vue'
import EditPassword from '@features/auth/components/EditPassword.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { HTML_ROLE } from '@shared/constants/html'

import { authHandlers } from '@tests/msw/handlers/auth'
import { testServer } from '@tests/msw/testServer'

function mountComponent() {
  testServer.use(authHandlers.getPasswordRequirementsSuccess())

  return getMountComponent(AccountPage, { withQueryClient: true, withRouter: true })()
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
  const divider = wrapper.find(`hr[role="${HTML_ROLE.SEPARATOR}"]`)
  expect(divider.exists()).toBe(true)
})

test('renders a DeleteAccountModal', async () => {
  const wrapper = mountComponent()
  await flushPromises()
  const component = wrapper.findComponent(DeleteAccountModal)
  expect(component.exists()).toBe(true)
})

describe('while fetching password requirements', () => {
  test('does not render the page content', () => {
    const wrapper = mountComponent()

    // Assuming that if the heading isn't rendered, nothing else should be.
    const heading = wrapper.findByText('h1', AUTH_COPY.ACCOUNT_PAGE.HEADING)
    expect(heading).toBeUndefined()
  })
})
