// External
import { defineComponent, ref } from 'vue'

// Internal
import { useCleanUpInfiniteQuery } from '@shared/composables/useCleanUpInfiniteQuery'

import { testQueryClient } from '@tests/queryClient/testQueryClient'

const initialQueryKey = ['1']
const nextQueryKey = ['2']

const TestComponent = defineComponent({
  props: {
    pagesToKeep: {
      type: Number,
    },
  },
  setup(props) {
    const queryKey = ref(initialQueryKey)

    useCleanUpInfiniteQuery(queryKey, props.pagesToKeep)

    function changeQueryKey() {
      queryKey.value = nextQueryKey
    }

    return { changeQueryKey }
  },
  template: '<button @click="changeQueryKey" />',
})

const mountComponent = getMountComponent(TestComponent, { withQueryClient: true })

describe(`when the cached data isn't for an infinite query`, () => {
  test.each([
    { value: 'a' },
    { value: undefined },
    { value: null },
    { value: { other: true } },
    { value: { pages: [1] } },
    { value: { pageParams: [1] } },
  ])(`does nothing if the value is $value`, ({ value }) => {
    testQueryClient.setQueryData(initialQueryKey, value)

    const wrapper = mountComponent()
    wrapper.unmount()

    const data = testQueryClient.getQueryData(initialQueryKey)
    expect(data).toEqual(value)
  })
})

test('cleans up extra pages on unmount', () => {
  const initialData = { pages: [1, 2, 3], pageParams: [1, 2, 3] }
  testQueryClient.setQueryData(initialQueryKey, initialData)

  const wrapper = mountComponent()
  wrapper.unmount()

  const data = testQueryClient.getQueryData(initialQueryKey)
  expect(data).toEqual({ pages: [1], pageParams: [1] })
})

test('cleans up extra pages when the query key changes', async () => {
  const initialData = { pages: [1, 2, 3], pageParams: [1, 2, 3] }
  testQueryClient.setQueryData(initialQueryKey, initialData)

  const wrapper = mountComponent()
  const changeQueryKeyButton = wrapper.get('button')
  await changeQueryKeyButton.trigger('click')

  const data = testQueryClient.getQueryData(initialQueryKey)
  expect(data).toEqual({ pages: [1], pageParams: [1] })
})
