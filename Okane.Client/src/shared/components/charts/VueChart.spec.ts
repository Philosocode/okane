// External
import { CanvasRenderer } from 'echarts/renderers'
import { use } from 'echarts/core'
import { defineComponent } from 'vue'

// Internal
import VueChart from '@shared/components/charts/VueChart.vue'

const TestComponent = defineComponent({
  components: { VueChart },
  setup() {
    use([CanvasRenderer])
  },
  template: `<VueChart v-bind="$attrs" />`,
})

const mountComponent = getMountComponent(TestComponent)

test('renders a VChart with the passed attributes', () => {
  vi.spyOn(Element.prototype, 'clientWidth', 'get').mockReturnValue(1024)
  vi.spyOn(Element.prototype, 'clientHeight', 'get').mockReturnValue(768)

  const id = 'test-id'
  const wrapper = mountComponent({
    props: { id },
  })
  expect(wrapper.find(`#${id}`).exists()).toBe(true)
})
