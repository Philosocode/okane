// External
import { defineStore } from 'pinia'
import { ref } from 'vue'

// Internal
export type ModalTriggerStore = ReturnType<typeof useModalTriggerStore>

export const useModalTriggerStore = defineStore('ModalTriggerStore', () => {
  const modalTrigger = ref<HTMLButtonElement | null>(null)

  function setModalTrigger(trigger: HTMLButtonElement | null) {
    modalTrigger.value = trigger
  }

  return {
    modalTrigger,
    setModalTrigger,
  }
})
