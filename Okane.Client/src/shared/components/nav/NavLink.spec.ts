// Internal
import NavLink, { type NavLinkProps } from '@shared/components/nav/NavLink.vue'

import { appRoutes, ROUTE_NAME } from '@shared/services/router/router'

const defaultProps: NavLinkProps = {
  icon: 'fa-solid fa-sun',
  to: { name: ROUTE_NAME.LOGIN },
  text: 'Cool text',
}

const mountComponent = getMountComponent(NavLink, {
  props: defaultProps,
  withRouter: true,
})

test('renders a link with the expected attributes and content', () => {
  const wrapper = mountComponent()
  const link = wrapper.get('a')
  expect(link.attributes('href')).toBe(appRoutes.login.buildPath())
  expect(link.text()).toBe(defaultProps.text)
})

test('renders a decorative icon', () => {
  const wrapper = mountComponent()
  const icon = wrapper.get('svg')
  expect(icon.attributes('aria-hidden')).toBe('true')
})

test('passes extra attributes', () => {
  const id = 'cool-link'
  const wrapper = mountComponent({
    props: { ...defaultProps, id },
  })
  const link = wrapper.get('a')
  expect(link.attributes('id')).toBe(id)
})
