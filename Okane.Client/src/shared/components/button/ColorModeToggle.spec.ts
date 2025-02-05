// Internal
import ColorModeToggle from '@shared/components/button/ColorModeToggle.vue'

import { SHARED_COPY } from '@shared/constants/copy'

const mountComponent = getMountComponent(ColorModeToggle)

test('renders a button to switch color modes', async () => {
  const wrapper = mountComponent()
  const sunIconClass = '.fa-sun'
  const moonIconClass = '.fa-moon'

  const button = wrapper.get('button')
  expect(button.text()).toBe(SHARED_COPY.ACTIONS.SWITCH_TO_DARK_MODE)
  expect(button.find(sunIconClass).exists()).toBe(true)

  await button.trigger('click')
  expect(button.text()).toBe(SHARED_COPY.ACTIONS.SWITCH_TO_LIGHT_MODE)
  expect(button.find(moonIconClass).exists()).toBe(true)

  await button.trigger('click')
  expect(button.text()).toBe(SHARED_COPY.ACTIONS.SWITCH_TO_DARK_MODE)
  expect(button.find(sunIconClass).exists()).toBe(true)
})
