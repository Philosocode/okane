// Internal
import { useToastStore } from '@shared/composables/useToastStore'

import { createTestToast } from '@tests/factories/toaster'

test('creates and removes toasts', () => {
  const { createToast, removeToast, toasts } = useToastStore()

  const toast1 = createTestToast({ text: 'Cool toast' })
  createToast(toast1.text)

  const toast2 = createTestToast({ text: 'Bad toast', type: 'error' })
  createToast(toast2.text, toast2.type)

  expect(toasts).toEqual([
    expect.objectContaining({
      text: toast1.text,
      type: toast1.type,
    }),
    expect.objectContaining({
      text: toast2.text,
      type: toast2.type,
    }),
  ])

  removeToast(toasts[0].id)

  expect(toasts).toEqual([
    expect.objectContaining({
      text: toast2.text,
      type: toast2.type,
    }),
  ])
})
