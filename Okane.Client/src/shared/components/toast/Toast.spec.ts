// Internal
import Toast from '@shared/components/toast/Toast.vue'

import { HTML_ROLE } from '@shared/constants/html'
import { SHARED_COPY } from '@shared/constants/copy'
import { TOAST_HIDE_AFTER_MS } from '@shared/constants/toast'

import { useToastStore } from '@shared/composables/useToastStore'

import { createTestToast } from '@tests/factories/toaster'
import { useMockedStore } from '@tests/composables/useMockedStore'

const mountComponent = getMountComponent(Toast, {
  withPinia: true,
})

const spyOn = {
  removeToast() {
    const toastStore = useMockedStore(useToastStore)
    return vi.spyOn(toastStore, 'removeToast')
  },
}

const defaultToast = createTestToast()

test('renders the toast text', () => {
  const wrapper = mountComponent({
    props: {
      toast: defaultToast,
    },
  })
  expect(wrapper.findByText('p', defaultToast.text)).toBeDefined()
})

test('applies attributes for a success toast', () => {
  const toast = createTestToast({ type: 'success' })
  const wrapper = mountComponent({ props: { toast } })
  const element = wrapper.get(`[role=${HTML_ROLE.STATUS}]`)
  expect(element.attributes('aria-atomic')).toBe('true')
})

test('applies attributes for an error toast', () => {
  const toast = createTestToast({ type: 'error' })
  const wrapper = mountComponent({ props: { toast } })
  const element = wrapper.get(`[role=${HTML_ROLE.ALERT}]`)
  expect(element.attributes('aria-atomic')).toBe('true')
  expect(element.attributes('aria-live')).toBe('assertive')
  expect(element.classes()).toContain('is-error')
})

test('renders a button to dismiss the toast', async () => {
  const removeSpy = spyOn.removeToast()
  const wrapper = mountComponent({
    props: {
      toast: defaultToast,
    },
  })
  const button = wrapper.get('button')
  expect(button.text()).toBe(SHARED_COPY.ACTIONS.DISMISS)

  await button.trigger('click')
  expect(removeSpy).toHaveBeenCalledOnce()
  expect(removeSpy).toHaveBeenCalledWith(defaultToast.id)
})

test(`automatically dismisses the toast after ${TOAST_HIDE_AFTER_MS}ms`, async () => {
  vi.useFakeTimers()

  const removeSpy = spyOn.removeToast()
  mountComponent({
    props: {
      toast: defaultToast,
    },
  })

  expect(removeSpy).not.toHaveBeenCalled()

  await vi.advanceTimersByTimeAsync(TOAST_HIDE_AFTER_MS - 1)
  expect(removeSpy).not.toHaveBeenCalled()

  await vi.advanceTimersByTimeAsync(1)
  expect(removeSpy).toHaveBeenCalledOnce()
  expect(removeSpy).toHaveBeenCalledWith(defaultToast.id)

  await vi.runOnlyPendingTimersAsync()
  vi.useRealTimers()
})

test(`does not dismiss the toast on unmount`, async () => {
  vi.useFakeTimers()

  const removeSpy = spyOn.removeToast()
  const wrapper = mountComponent({
    props: {
      toast: defaultToast,
    },
  })

  expect(removeSpy).not.toHaveBeenCalled()

  wrapper.unmount()
  await vi.advanceTimersByTimeAsync(TOAST_HIDE_AFTER_MS)

  expect(removeSpy).not.toHaveBeenCalled()

  await vi.runOnlyPendingTimersAsync()
  vi.useRealTimers()
})
