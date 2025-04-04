// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { authApiRoutes } from '@features/auth/constants/apiRoutes'
import { HTTP_HEADER } from '@shared/constants/http'

import { useSendVerificationEmail } from '@features/auth/composables/useSendVerificationEmail'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { wrapInApiResponse } from '@tests/utils/apiResponse'

const spyOn = {
  post() {
    return vi.spyOn(apiClient, 'post').mockResolvedValue(wrapInApiResponse('ok'))
  },
}

const email = 'sir-doggo@okane.com'

const TestComponent = defineComponent({
  setup() {
    const mutation = useSendVerificationEmail()
    mutation.mutate({ email })
  },
  template: '<div />',
})

const mountComponent = getMountComponent(TestComponent, { withQueryClient: true })

test('makes a POST request to the expected endpoint', async () => {
  const postSpy = spyOn.post()

  mountComponent()
  await flushPromises()
  expect(postSpy).toHaveBeenCalledWith(
    authApiRoutes.sendVerificationEmail(),
    { email },
    {
      headers: {
        [HTTP_HEADER.X_USER_EMAIL]: email,
      },
    },
  )
})
