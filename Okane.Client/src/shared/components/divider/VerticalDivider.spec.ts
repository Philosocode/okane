// Internal
import VerticalDivider from '@shared/components/divider/VerticalDivider.vue'

import { HTML_ROLE } from '@shared/constants/html'

const mountComponent = getMountComponent(VerticalDivider)

test('renders a divider with the expected attributes', () => {
  const id = 'cool-id'
  const wrapper = mountComponent({
    props: { id },
  })

  const divider = wrapper.get(`[role=${HTML_ROLE.SEPARATOR}]`)
  expect(divider.attributes('id')).toBe(id)
})
