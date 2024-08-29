// External
import { toRef } from 'vue'

// Internal
import Observer from '@shared/components/Observer.vue'

import { DEFAULT_DEBOUNCE_DELAY } from '@shared/constants/request'

import { setUpIntersectionObserverMock } from '@tests/mocks/intersectionObserver'

const mountComponent = getMountComponent(Observer)

const disconnect = vi.fn()

function setUpIntersectionObserver(isIntersecting = true) {
  vi.stubGlobal(
    'IntersectionObserver',
    setUpIntersectionObserverMock({
      isIntersecting,
      disconnect,
    }),
  )
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(async () => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()

  await vi.runOnlyPendingTimersAsync()
  vi.useRealTimers()
})

test(`emits a 'change' event`, async () => {
  setUpIntersectionObserver()

  const wrapper = mountComponent()

  await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_DELAY)

  const emitted = wrapper.emitted<boolean[]>('change')
  const emittedData = emitted?.[0][0]

  expect(emittedData).toBe(true)
})

test('does not emit an event when not intersecting', async () => {
  setUpIntersectionObserver(false)

  const wrapper = mountComponent()

  await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_DELAY)

  const emitted = wrapper.emitted<boolean[]>()
  expect(emitted).not.toHaveProperty('change')
})

test('applies a custom debounce time', async () => {
  setUpIntersectionObserver()

  const debounceDelay = DEFAULT_DEBOUNCE_DELAY * 2

  const wrapper = mountComponent({
    props: { watchDebounceDelay: debounceDelay },
  })

  await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_DELAY)

  let emitted = wrapper.emitted<boolean[]>()

  expect(emitted).not.toHaveProperty('change')

  await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_DELAY)

  emitted = wrapper.emitted<boolean[]>()

  expect(emitted).toHaveProperty('change')
})

test('emits multiple events when the watchDep changes', async () => {
  setUpIntersectionObserver()

  const watchDep = toRef(1)
  const wrapper = mountComponent({
    props: { watchDep },
  })

  await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_DELAY)

  watchDep.value = 2

  await vi.advanceTimersByTimeAsync(DEFAULT_DEBOUNCE_DELAY)

  const emitted = wrapper.emitted<boolean[]>('change')
  expect(emitted).toHaveLength(2)
})

test('disconnects the observer on unmount', () => {
  setUpIntersectionObserver()

  const wrapper = mountComponent()

  expect(disconnect).not.toHaveBeenCalled()

  wrapper.unmount()

  expect(disconnect).toHaveBeenCalledOnce()
})
