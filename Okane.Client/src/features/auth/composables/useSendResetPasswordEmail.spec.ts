// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { authApiRoutes } from '@features/auth/constants/apiRoutes'
import { HONEYPOT_INPUT_NAME } from '@shared/constants/form'
import { HTTP_HEADER } from '@shared/constants/http'

import { useSendResetPasswordEmail } from '@features/auth/composables/useSendResetPasswordEmail'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { wrapInApiResponse } from '@tests/utils/apiResponse'

const spyOn = {
  post() {
    return vi.spyOn(apiClient, 'post').mockResolvedValue(wrapInApiResponse('ok'))
  },
}

const email = 'sir-doggo@okane.com'
const honeypot = 'I am human'

const TestComponent = defineComponent({
  setup() {
    const mutation = useSendResetPasswordEmail()
    mutation.mutate({
      email,
      [HONEYPOT_INPUT_NAME]: honeypot,
    })
  },
  template: '<div />',
})

const mountComponent = getMountComponent(TestComponent, { withQueryClient: true })

test('makes a POST request to the expected endpoint', async () => {
  const postSpy = spyOn.post()

  mountComponent()
  await flushPromises()
  expect(postSpy).toHaveBeenCalledWith(
    authApiRoutes.sendResetPasswordEmail(),
    {
      email,
      [HONEYPOT_INPUT_NAME]: honeypot,
    },
    {
      headers: {
        [HTTP_HEADER.X_USER_EMAIL]: email,
      },
    },
  )
})
