// External
import { ref } from 'vue'
import { defineStore } from 'pinia'

// Internal
import { type Toast } from '@shared/types/toaster'

export type ToastStore = ReturnType<typeof useToastStore>

export const useToastStore = defineStore('ToastStore', () => {
  const id = ref(0)
  const toasts = ref<Toast[]>([])

  function createToast(text: Toast['text'], type: Toast['type'] = 'success') {
    toasts.value.push({ id: id.value, text, type })
    id.value++
  }

  function removeToast(id: number) {
    const indexToRemove = toasts.value.findIndex((toast) => toast.id === id)
    if (indexToRemove !== -1) {
      toasts.value.splice(indexToRemove, 1)
    }
  }

  return {
    get toasts() {
      return toasts.value
    },

    createToast,
    removeToast,
  }
})
