// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { authApiRoutes } from '@features/auth/constants/apiRoutes'

import { useResetPassword } from '@features/auth/composables/useResetPassword'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { wrapInApiResponse } from '@tests/utils/apiResponse'

const spyOn = {
  post() {
    return vi.spyOn(apiClient, 'post').mockResolvedValue(wrapInApiResponse('ok'))
  },
}

const email = 'sir-doggo@okane.com'
const password = 'cool-password'
const token = 'cool-token'

const TestComponent = defineComponent({
  setup() {
    const mutation = useResetPassword()
    mutation.mutate({ email, password, token })
  },
  template: '<div />',
})

const mountComponent = getMountComponent(TestComponent, { withQueryClient: true })

test('makes a POST request to the expected endpoint', async () => {
  const postSpy = spyOn.post()

  mountComponent()
  await flushPromises()
  expect(postSpy).toHaveBeenCalledWith(authApiRoutes.resetPassword(), { email, password, token })
})
