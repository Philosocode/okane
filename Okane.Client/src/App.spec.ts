// Internal
import App from './App.vue'
import Footer from '@shared/components/Footer.vue'
import NavBar from '@shared/components/NavBar.vue'
import Toaster from '@shared/components/toast/Toaster.vue'

const mountComponent = getMountComponent(App, {
  global: {
    stubs: {
      NavBar: true,
      RouterView: true,
      Teleport: true,
      Toaster: true,
    },
  },
  withRouter: true,
  withQueryClient: true,
})

test('renders a nav bar', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(NavBar).exists()).toBe(true)
})

test('renders a toaster', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(Toaster).exists()).toBe(true)
})

test('renders a footer', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(Footer).exists()).toBe(true)
})
