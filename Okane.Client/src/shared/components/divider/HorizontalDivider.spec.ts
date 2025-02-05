// Internal
import HorizontalDivider from '@shared/components/divider/HorizontalDivider.vue'

import { HTML_ROLE } from '@shared/constants/html'

const mountComponent = getMountComponent(HorizontalDivider)

test('renders a divider with the expected attributes', () => {
  const id = 'cool-id'
  const wrapper = mountComponent({
    props: { id },
  })

  const divider = wrapper.get(`div[role=${HTML_ROLE.SEPARATOR}]`)
  expect(divider.attributes('id')).toBe(id)
})
