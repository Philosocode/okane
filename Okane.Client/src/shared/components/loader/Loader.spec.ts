// Internal
import Loader from '@shared/components/loader/Loader.vue'

const mountComponent = getMountComponent(Loader)

test('renders an accessible SVG with a default title', () => {
  const wrapper = mountComponent()
  const svg = wrapper.find('svg')
  expect(svg.exists()).toBe(true)

  const title = svg.get('title')
  expect(title.text()).toBe('Loading...')

  const spinner = svg.get('g')
  expect(spinner.attributes('aria-hidden')).toBe('true')
})

test('renders with the passed title', () => {
  const title = 'Loading finance records'
  const wrapper = mountComponent({ props: { title } })
  const titleElement = wrapper.get('title')

  expect(titleElement.text()).toBe(title)
})