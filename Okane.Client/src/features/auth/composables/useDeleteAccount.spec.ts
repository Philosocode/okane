// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { authAPIRoutes } from '@features/auth/constants/apiRoutes'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { useAuthStore } from '@features/auth/composables/useAuthStore'
import { useDeleteAccount } from '@features/auth/composables/useDeleteAccount'

import { useMockedStore } from '@tests/composables/useMockedStore'

const spyOn = {
  apiDelete() {
    return vi.spyOn(apiClient, 'delete').mockResolvedValue()
  },
  authStoreResetState() {
    const authStore = useMockedStore(useAuthStore)
    return vi.spyOn(authStore, 'resetState')
  },
}

const TestComponent = defineComponent({
  setup() {
    const mutation = useDeleteAccount()
    mutation.mutate()
  },
  template: '<div />',
})

const mountComponent = getMountComponent(TestComponent, { withQueryClient: true })

test('makes a DELETE request to the expected endpoint', async () => {
  const deleteSpy = spyOn.apiDelete()
  mountComponent()
  await flushPromises()
  expect(deleteSpy).toHaveBeenCalledWith(authAPIRoutes.self())
})

test('resets the auth store state', async () => {
  const resetSpy = spyOn.authStoreResetState()
  spyOn.apiDelete()

  mountComponent()
  await flushPromises()
  expect(resetSpy).toHaveBeenCalledOnce()
})
