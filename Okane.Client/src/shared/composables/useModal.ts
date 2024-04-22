// External
import { ref } from 'vue'

export function useModal() {
  const modalIsShowing = ref(false)

  function showModal() {
    modalIsShowing.value = true
  }

  function closeModal() {
    modalIsShowing.value = false
  }

  return {
    modalIsShowing,
    showModal,
    closeModal,
  }
}
