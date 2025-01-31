// Internal
import BulletedList from '@shared/components/BulletedList.vue'

const mountComponent = getMountComponent(BulletedList)

test('renders a ul with the provided attributes & content', () => {
  const id = 'cool-id'
  const text = 'Test'
  const wrapper = mountComponent({
    props: { id },
    slots: {
      default: text,
    },
  })

  const list = wrapper.findByText('ul', text)
  expect(list).toBeDefined()
  expect(list.attributes('id')).toBe(id)
})
