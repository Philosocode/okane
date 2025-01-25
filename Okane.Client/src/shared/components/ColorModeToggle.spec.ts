// Internal
import ColorModeToggle from '@shared/components/ColorModeToggle.vue'

import { SHARED_COPY } from '@shared/constants/copy'

const mountComponent = getMountComponent(ColorModeToggle)

test('renders a button to switch color modes', async () => {
  const wrapper = mountComponent()
  const button = wrapper.get('button')
  expect(button.text()).toBe(SHARED_COPY.ACTIONS.SWITCH_TO_DARK_MODE)

  await button.trigger('click')
  expect(button.text()).toBe(SHARED_COPY.ACTIONS.SWITCH_TO_LIGHT_MODE)

  await button.trigger('click')
  expect(button.text()).toBe(SHARED_COPY.ACTIONS.SWITCH_TO_DARK_MODE)
})
