// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { authAPIRoutes } from '@features/auth/constants/apiRoutes'

import { useQueryPasswordRequirements } from '@features/auth/composables/useQueryPasswordRequirements'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { wrapInAPIResponse } from '@tests/utils/apiResponse'

const getResponse = 'cool-requirements'

const spyOn = {
  get() {
    return vi.spyOn(apiClient, 'get').mockResolvedValue(wrapInAPIResponse(getResponse))
  },
}

const TestComponent = defineComponent({
  setup() {
    const { data } = useQueryPasswordRequirements()
    return { data }
  },
  template: '<div>{{ data }}</div>',
})

const mountComponent = getMountComponent(TestComponent, { withQueryClient: true })

test('makes a GET request to the expected endpoint', async () => {
  const getSpy = spyOn.get()

  const wrapper = mountComponent()
  await flushPromises()
  expect(getSpy).toHaveBeenCalledWith(authAPIRoutes.passwordRequirements(), {
    signal: new AbortController().signal,
  })
  expect(wrapper.findByText('div', getResponse)).toBeDefined()
})