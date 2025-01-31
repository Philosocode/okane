// Internal
import Link from '@shared/components/Link.vue'

import { appRoutes, ROUTE_NAME } from '@shared/services/router/router'

const mountComponent = getMountComponent(Link, { withRouter: true })

test('renders a link with the expected attributes and content', () => {
  const id = 'cool-link'
  const text = 'Test'
  const to = { name: ROUTE_NAME.LOGIN }
  const wrapper = mountComponent({
    props: { id, to },
    slots: {
      default: text,
    },
  })

  const link = wrapper.get('a')
  expect(link.attributes('href')).toBe(appRoutes.login.buildPath())
  expect(link.text()).toBe(text)
})
