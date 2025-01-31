// Internal
import Footer from '@shared/components/Footer.vue'

import { SHARED_COPY } from '@shared/constants/copy'

const mountComponent = getMountComponent(Footer)

test('renders the expected text', () => {
  const wrapper = mountComponent()
  expect(wrapper.get('footer').text()).toBe(SHARED_COPY.COPYRIGHT)
})
