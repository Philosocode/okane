// External
import { defineComponent } from 'vue'

// Internal
import ToggleMenu from '@shared/components/ToggleMenu.vue'

import { ARIA_ATTRIBUTES } from '@shared/constants/aria'
import { SHARED_COPY } from '@shared/constants/copy'

import { useModalTriggerStore } from '@shared/composables/useModalTriggerStore'

const outsideOfMenuTestId = 'outsideOfMenu'

const TestComponent = defineComponent({
  components: { ToggleMenu },
  props: {
    actions: Array,
    menuId: String,
  },
  template: `
    <template>
      <button data-testid="${outsideOfMenuTestId}">Hello</button>
      
      <div>
        <ToggleMenu :actions="$props.actions" :menu-id="$props.menuId" />
      </div>
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

const props = {
  actions: [],
  menuId: 'toggle-menu-id',
}

const selectors = {
  menu: 'ul[role="menu"]',
  toggleButton: `button[${ARIA_ATTRIBUTES.HAS_POPUP}="true"]`,
}

test('renders a menu toggle', () => {
  const wrapper = mountComponent()({ props })
  const menuToggle = wrapper.findByText('button', SHARED_COPY.TOGGLE_MENU.BUTTON_TITLE)
  expect(menuToggle.attributes(ARIA_ATTRIBUTES.HAS_POPUP)).toBe('true')
  expect(menuToggle.attributes(ARIA_ATTRIBUTES.CONTROLS)).toBe(props.menuId)
  expect(menuToggle.attributes(ARIA_ATTRIBUTES.EXPANDED)).toBe('false')

  const title = menuToggle.get(`title`)
  expect(title.text()).toBe(SHARED_COPY.TOGGLE_MENU.BUTTON_TITLE)
})

test('initially hides the menu', () => {
  const wrapper = mountComponent()({ props })
  const menu = wrapper.find(selectors.menu)
  expect(menu.exists()).toBe(false)
})

describe('after clicking the menu toggle', () => {
  async function setUp() {
    const actions = getActions()

    const wrapper = mountComponent()({
      attachTo: document.body,
      props: { ...props, actions },
    })

    const toggleButton = wrapper.get(selectors.toggleButton)
    await toggleButton.trigger('click')

    return { actions, wrapper }
  }

  test('shows the menu without setting the modal trigger', async () => {
    const triggerStore = useModalTriggerStore()
    const { wrapper } = await setUp()
    const toggleButton = wrapper.get(selectors.toggleButton)
    expect(toggleButton.attributes(ARIA_ATTRIBUTES.EXPANDED)).toBe('true')
    expect(triggerStore.modalTrigger).toBeNull()

    const menu = wrapper.get(selectors.menu)
    expect(menu.attributes('id')).toBe(props.menuId)
  })

  test('renders clickable menu actions', async () => {
    const triggerStore = useModalTriggerStore()

    const { actions, wrapper } = await setUp()
    const menuLis = wrapper.findAll('li[role="presentation"]')
    expect(menuLis).toHaveLength(actions.length)

    for (let i = 0; i < menuLis.length; i++) {
      const menuButton = menuLis[i].get('button[role="menuitem"]')
      expect(menuButton.text()).toBe(actions[i].text)

      await menuButton.trigger('click')
      expect(actions[i].onClick).toHaveBeenCalledOnce()

      const toggleButton = wrapper.get(selectors.toggleButton)
      expect(triggerStore.modalTrigger).toBe(toggleButton.element)

      // After clicking an action, the menu should be closed and re-opened.
      const menu = wrapper.find(selectors.menu)
      expect(menu.exists()).toBe(false)

      await toggleButton.trigger('click')
    }
  })
})
