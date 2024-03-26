// External
import { defineComponent, h } from 'vue'

// Internal
import PageLayout from '@/shared/layouts/PageLayout.vue'

const mountComponent = getMountComponent(PageLayout)

test('renders the slot content', () => {
  const SlotComponent = defineComponent({
    template: `<div id="slot-component">Hello world</div>`,
  })

  const wrapper = mountComponent({
    slots: {
      default: () => h(SlotComponent),
    },
  })

  const child = wrapper.find('#slot-component')
  expect(child.exists()).toBe(true)
})
