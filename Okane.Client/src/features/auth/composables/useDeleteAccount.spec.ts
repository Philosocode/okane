// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { authApiRoutes } from '@features/auth/constants/apiRoutes'

import { useDeleteAccount } from '@features/auth/composables/useDeleteAccount'

import { apiClient } from '@shared/services/apiClient/apiClient'

const TestComponent = defineComponent({
  setup() {
    const mutation = useDeleteAccount()
    mutation.mutate()
  },
  template: '<div />',
})

const mountComponent = getMountComponent(TestComponent, { withQueryClient: true })

test('makes a DELETE request to the expected endpoint', async () => {
  const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValue()
  mountComponent()
  await flushPromises()
  expect(deleteSpy).toHaveBeenCalledWith(authApiRoutes.self())
})
