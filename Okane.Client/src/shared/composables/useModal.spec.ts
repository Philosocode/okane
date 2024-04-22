// Internal
import { useModal } from '@shared/composables/useModal'

test('updates the modal show state', () => {
  const { modalIsShowing, showModal, closeModal } = useModal()

  expect(modalIsShowing.value).toBe(false)

  showModal()

  expect(modalIsShowing.value).toBe(true)

  closeModal()

  expect(modalIsShowing.value).toBe(false)
})
