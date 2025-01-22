// Internal
import Toast from '@shared/components/toast/Toast.vue'
import Toaster from '@shared/components/toast/Toaster.vue'

import { useToastStore } from '@shared/composables/useToastStore'

const mountComponent = getMountComponent(Toaster, {
  global: {
    stubs: {
      IconButton: true,
    },
  },
  withPinia: true,
})

test('renders a Toast for each toast', () => {
  const parent = document.createElement('div')
  parent.id = 'toaster'
  document.body.appendChild(parent)

  const toastStore = useToastStore()
  const toastNames = new Set(['Toast 1', 'Toast 2', 'Toast 3'])
  toastNames.forEach((name) => {
    toastStore.createToast(name)
  })

  const wrapper = mountComponent()
  const toasts = wrapper.findAllComponents(Toast)
  toasts.forEach((toast) => {
    expect(toastNames.has(toast.text())).toBe(true)
    toastNames.delete(toast.text())
  })

  document.body.innerHTML = ''
})
