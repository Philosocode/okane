// External
import { defineComponent } from 'vue'

// Internal
import ToggleMenu from '@shared/components/ToggleMenu.vue'

import { SHARED_COPY } from '@shared/constants/copy'

const outsideOfMenuTestId = 'outsideOfMenu'

const TestComponent = defineComponent({
  components: { ToggleMenu },
  props: {
    actions: Array,
  },
  template: `
    <template>
      <div data-testid="${outsideOfMenuTestId}" />
      <ToggleMenu :actions="$props.actions" />
    </template>
  `,
})

function mountComponent() {
  return getMountComponent(TestComponent)
}

function getActions() {
  return [
    {
      onClick: vi.fn(),
      text: 'Action 1',
    },
    {
      onClick: vi.fn(),
      text: 'Action 2',
    },
  ]
}

test('renders a menu toggle', () => {
  const wrapper = mountComponent()({
    props: {
      actions: getActions(),
    },
  })

  const menuToggle = wrapper.get('button')
  const title = menuToggle.get(`title`)
  expect(title.text()).toBe(SHARED_COPY.MENU.TOGGLE_TITLE)
})

test('initially hides the menu', () => {
  const wrapper = mountComponent()({
    props: {
      actions: getActions(),
    },
  })

  const menu = wrapper.get('ul.menu')
  expect(menu.isVisible()).toBe(false)
})

describe('after clicking the menu toggle', () => {
  function setUp() {
    const actions = getActions()

    const wrapper = mountComponent()({
      props: { actions },
    })

    return { actions, wrapper }
  }

  test('renders clickable menu actions', async () => {
    const { actions, wrapper } = setUp()

    for (const action of actions) {
      const button = wrapper.findByText('button', action.text)
      expect(button.exists()).toBe(true)

      await button.trigger('click')
      expect(action.onClick).toHaveBeenCalledOnce()
    }
  })

  test('hides the menu when clicking away', async () => {
    const { wrapper } = setUp()
    const outsideOfMenu = wrapper.get(`[data-testid="${outsideOfMenuTestId}"]`)
    await outsideOfMenu.trigger('click')

    const menu = wrapper.get('ul.menu')
    expect(menu.isVisible()).toBe(false)
  })
})
