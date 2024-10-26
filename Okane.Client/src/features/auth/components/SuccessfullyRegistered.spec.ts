// Internal
import Heading from '@shared/components/Heading.vue'
import SuccessfullyRegistered from '@features/auth/components/SuccessfullyRegistered.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

const mountComponent = getMountComponent(SuccessfullyRegistered)

test('renders a heading', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(Heading).text()).toBe(AUTH_COPY.SUCCESSFULLY_REGISTERED.HEADING)
})

test('renders body text', () => {
  const wrapper = mountComponent()
  expect(wrapper.findByText('p', AUTH_COPY.SUCCESSFULLY_REGISTERED.BODY)).toBeDefined()
})
