// External
import { defineComponent } from 'vue'
import { flushPromises } from '@vue/test-utils'

// Internal
import { authAPIRoutes } from '@features/auth/constants/apiRoutes'

import {
  defaultBody,
  useEditSelf,
  type PatchSelfBody,
} from '@features/auth/composables/useEditSelf'

import { apiClient } from '@shared/services/apiClient/apiClient'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { createTestUser } from '@tests/factories/user'
import { useMockedStore } from '@tests/composables/useMockedStore'
import { wrapInApiResponse } from '@tests/utils/apiResponse'

const spyOn = {
  authStore() {
    const authStore = useMockedStore(useAuthStore)
    authStore.authUser = createTestUser()
    return authStore
  },
  patch() {
    return vi.spyOn(apiClient, 'patch').mockResolvedValue(wrapInApiResponse('ok'))
  },
}

function getTestComponent(body: PatchSelfBody) {
  return defineComponent({
    setup() {
      const mutation = useEditSelf()
      mutation.mutate(body)
    },
    template: '<div />',
  })
}

function mountComponent(body: PatchSelfBody) {
  return getMountComponent(getTestComponent(body), { withQueryClient: true })()
}

describe('with an empty body', () => {
  const body = defaultBody

  test("makes a PATCH request and does not update the auth user's name", async () => {
    const patchSpy = spyOn.patch()
    const authStore = spyOn.authStore()
    const originalName = authStore.authUser?.name

    mountComponent(body)
    await flushPromises()
    expect(patchSpy).toHaveBeenCalledWith(authAPIRoutes.self(), body)
    expect(authStore.authUser?.name).toBe(originalName)
  })
})

describe('when updating the password', () => {
  const body: PatchSelfBody = {
    ...defaultBody,
    currentPassword: 'currentPassword',
    newPassword: 'newPassword',
  }

  test("makes a PATCH request and does not update the auth user's name", async () => {
    const patchSpy = spyOn.patch()
    const authStore = spyOn.authStore()
    const originalName = authStore.authUser?.name

    mountComponent(body)
    await flushPromises()
    expect(patchSpy).toHaveBeenCalledWith(authAPIRoutes.self(), body)
    expect(authStore.authUser?.name).toBe(originalName)
  })
})

describe('when updating the name', () => {
  const body: PatchSelfBody = {
    ...defaultBody,
    name: 'Updated Name',
  }

  test("makes a PATCH request and updates the auth user's name", async () => {
    const patchSpy = spyOn.patch()
    const authStore = spyOn.authStore()

    mountComponent(body)
    await flushPromises()
    expect(patchSpy).toHaveBeenCalledWith(authAPIRoutes.self(), body)
    expect(authStore.authUser?.name).toBe(body.name)
  })
})
