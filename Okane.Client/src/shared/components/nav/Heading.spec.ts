// External
import type { HeadingTag } from '@shared/types/html'

// Internal
import Heading from '@shared/components/nav/Heading.vue'

const mountComponent = getMountComponent(Heading)

const table: HeadingTag[][] = [['h1'], ['h2'], ['h3'], ['h4'], ['h5'], ['h6']]

test.each(table)('<Heading tag="%s" />', (tag) => {
  const wrapper = mountComponent({
    props: { tag },
  })

  expect(wrapper.find(tag).exists()).toBe(true)
})

test('renders the passed content', () => {
  const slotText = 'Hello world'
  const wrapper = mountComponent({
    props: { tag: 'h1' },
    slots: {
      default: () => slotText,
    },
  })

  const heading = wrapper.get('h1')
  expect(heading.text()).toBe(slotText)
})
