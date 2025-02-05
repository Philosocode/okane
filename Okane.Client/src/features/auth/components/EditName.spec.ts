// External
import { http, HttpResponse, RequestHandler } from 'msw'

import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import EditName from '@features/auth/components/EditName.vue'

import { authApiRoutes } from '@features/auth/constants/apiRoutes'
import { AUTH_COPY } from '@features/auth/constants/copy'
import { HTTP_STATUS_CODE } from '@shared/constants/http'
import { BUTTON_TYPE, INPUT_TYPE } from '@shared/constants/form'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { createTestUser } from '@tests/factories/user'
import { getMswUrl } from '@tests/utils/url'
import { useMockedStore } from '@tests/composables/useMockedStore'
import { testServer } from '@tests/msw/testServer'

const mountComponent = getMountComponent(EditName, {
  withPinia: true,
  withQueryClient: true,
})

const elements = {
  nameInput(wrapper: VueWrapper) {
    return wrapper.get('input[name="name"]')
  },
  saveButton(wrapper: VueWrapper) {
    return wrapper.get(`button[type="${BUTTON_TYPE.SUBMIT}"]`)
  },
}

const spyOn = {
  authStore() {
    return useMockedStore(useAuthStore)
  },
}

test('renders a heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.findByText('h2', AUTH_COPY.ACCOUNT_PAGE.EDIT_NAME)
  expect(heading).toBeDefined()
})

test('renders a name input', () => {
  const name = 'Sir Doggo'
  const authStore = spyOn.authStore()
  authStore.authUser = createTestUser({ name })

  const wrapper = mountComponent()
  const input = elements.nameInput(wrapper)
  expect(input.attributes('type')).toBe(INPUT_TYPE.TEXT)

  const label = wrapper.findByText('label', AUTH_COPY.AUTH_FORM.NAME)
  expect(label).toBeDefined()

  const inputElement = input.element as HTMLInputElement
  expect(inputElement.value).toBe(name)
})

test('renders a disabled save button', () => {
  const wrapper = mountComponent()
  const button = elements.saveButton(wrapper)
  expect(button.attributes('disabled')).toBeDefined()
})

test('does not render a submit error', () => {
  const wrapper = mountComponent()
  const error = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.EDIT_NAME_ERROR)
  expect(error).toBeUndefined()
})

test('does not render a success message', () => {
  const wrapper = mountComponent()
  const message = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.EDIT_NAME_SUCCESS)
  expect(message).toBeUndefined()
})

describe('when name is empty', () => {
  test('disables the save button', async () => {
    const wrapper = mountComponent()
    const input = elements.nameInput(wrapper)
    await input.setValue('')
    const button = elements.saveButton(wrapper)
    expect(button.attributes('disabled')).toBeDefined()
  })
})

describe('when name is unchanged', () => {
  test('disables the save button', async () => {
    const name = 'Sir Doggo'
    const authStore = spyOn.authStore()
    authStore.authUser = createTestUser({ name })

    const wrapper = mountComponent()
    const button = elements.saveButton(wrapper)

    const input = elements.nameInput(wrapper)
    await input.setValue(name + '1')
    expect(button.attributes('disabled')).toBeUndefined()

    await input.setValue(name)
    expect(button.attributes('disabled')).toBeDefined()
  })
})

async function setUpWrapperSubmitWithName(handler: RequestHandler) {
  testServer.use(handler)

  const wrapper = mountComponent()
  const nameInput = elements.nameInput(wrapper)
  await nameInput.setValue('Sir Doggo The Great')

  const saveButton = elements.saveButton(wrapper)
  await saveButton.trigger('submit')
  await flushPromises()

  return wrapper
}

describe('when patch request succeeds', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = await setUpWrapperSubmitWithName(
      http.patch(getMswUrl(authApiRoutes.self()), () =>
        HttpResponse.json({}, { status: HTTP_STATUS_CODE.OK_200 }),
      ),
    )
  })

  test('renders a success message', () => {
    const message = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.EDIT_NAME_SUCCESS)
    expect(message).toBeDefined()
  })

  test('does not render a submit error', () => {
    const error = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.EDIT_NAME_ERROR)
    expect(error).toBeUndefined()
  })

  test('hides the success message when updating the name', async () => {
    const nameInput = wrapper.get('input[name="name"]')
    await nameInput.setValue('a')

    const message = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.EDIT_NAME_SUCCESS)
    expect(message).toBeUndefined()
  })
})

describe('when patch request fails', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = await setUpWrapperSubmitWithName(
      http.patch(getMswUrl(authApiRoutes.self()), () =>
        HttpResponse.json(createTestProblemDetails(), { status: HTTP_STATUS_CODE.BAD_REQUEST_400 }),
      ),
    )
  })

  test('renders an error message', () => {
    const error = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.EDIT_NAME_ERROR)
    expect(error).toBeDefined()
  })

  test('does not render a success message', () => {
    const message = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.EDIT_NAME_SUCCESS)
    expect(message).toBeUndefined()
  })
})
