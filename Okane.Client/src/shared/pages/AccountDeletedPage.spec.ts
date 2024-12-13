// Internal
import AccountDeletedPage from '@shared/pages/AccountDeletedPage.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

const mountComponent = getMountComponent(AccountDeletedPage)

test('renders a heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.findByText('h1', AUTH_COPY.ACCOUNT_DELETED.HEADING)
  expect(heading).toBeDefined()
})

test('renders a paragraph', () => {
  const wrapper = mountComponent()
  const text = wrapper.findByText('p', AUTH_COPY.ACCOUNT_DELETED.TEXT)
  expect(text).toBeDefined()
})
