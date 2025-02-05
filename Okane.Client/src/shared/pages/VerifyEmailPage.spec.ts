// External
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http, HttpResponse } from 'msw'

// Internal
import Loader from '@shared/components/loader/Loader.vue'
import VerifyEmailFailed from '@features/auth/components/VerifyEmailFailed.vue'
import VerifyEmailPage from '@shared/pages/VerifyEmailPage.vue'
import VerifyEmailSucceeded from '@features/auth/components/VerifyEmailSucceeded.vue'

import { authApiRoutes } from '@features/auth/constants/apiRoutes'
import { AUTH_COPY } from '@features/auth/constants/copy'
import { HTTP_STATUS_CODE } from '@shared/constants/http'
import { appRoutes, createAppRouter } from '@shared/services/router/router'

import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { getMswUrl } from '@tests/utils/url'
import { testServer } from '@tests/msw/testServer'

function getURL(queryString: string = '') {
  let url = appRoutes.verifyEmail.buildPath()
  if (queryString) url += `?${queryString}`
  return url
}

async function mountComponent(url: string = getURL()) {
  const router = createAppRouter()
  await router.push(url)

  return getMountComponent(VerifyEmailPage, {
    global: {
      stubs: {
        VerifyEmailFailed: true,
        VerifyEmailSucceeded: true,
      },
    },
    withQueryClient: true,
    withRouter: router,
  })()
}

const sharedAsserts = {
  doesNotRenderTheLoadingState(wrapper: VueWrapper) {
    const text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.PLEASE_WAIT)
    expect(text).toBeUndefined()

    const loader = wrapper.findComponent(Loader)
    expect(loader.exists()).toBe(false)
  },
  doesNotRenderTheMissingEmailText(wrapper: VueWrapper) {
    const text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.MISSING_EMAIL)
    expect(text).toBeUndefined()
  },
  doesNotRenderTheVerifyEmailFailedComponent(wrapper: VueWrapper) {
    const component = wrapper.findComponent(VerifyEmailFailed)
    expect(component.exists()).toBe(false)
  },
  doesNotRenderTheVerifyEmailSucceededComponent(wrapper: VueWrapper) {
    const component = wrapper.findComponent(VerifyEmailSucceeded)
    expect(component.exists()).toBe(false)
  },
}

test('renders the expected heading', async () => {
  const wrapper = await mountComponent()
  expect(wrapper.findByText('h1', AUTH_COPY.VERIFY_EMAIL.VERIFYING_YOUR_EMAIL)).toBeDefined()
})

describe('when the email param is missing', () => {
  test('does not render the loading state', async () => {
    const wrapper = await mountComponent()
    sharedAsserts.doesNotRenderTheLoadingState(wrapper)
  })

  test('renders the "missing email" text', async () => {
    const wrapper = await mountComponent()
    const text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.MISSING_EMAIL)
    expect(text).toBeDefined()
  })

  test('does not render the VerifyEmailFailed component', async () => {
    const wrapper = await mountComponent()
    sharedAsserts.doesNotRenderTheVerifyEmailFailedComponent(wrapper)
  })

  test('does not render the VerifyEmailSucceeded component', async () => {
    const wrapper = await mountComponent()
    sharedAsserts.doesNotRenderTheVerifyEmailSucceededComponent(wrapper)
  })
})

describe('when the token param is missing', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = await mountComponent(getURL('email=test@okane.com'))
    await flushPromises()
  })

  test('does not render the loading state', () => {
    sharedAsserts.doesNotRenderTheLoadingState(wrapper)
  })

  test('does not render the "missing email" text', () => {
    sharedAsserts.doesNotRenderTheMissingEmailText(wrapper)
  })

  test('renders the VerifyEmailFailed component', () => {
    const component = wrapper.findComponent(VerifyEmailFailed)
    expect(component.exists()).toBe(true)
  })

  test('does not render the VerifyEmailSucceeded component', () => {
    sharedAsserts.doesNotRenderTheVerifyEmailSucceededComponent(wrapper)
  })
})

describe('when verification fails', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    const errorHandler = http.post(getMswUrl(authApiRoutes.verifyEmail()), () =>
      HttpResponse.json(createTestProblemDetails(), {
        status: HTTP_STATUS_CODE.BAD_REQUEST_400,
      }),
    )
    testServer.use(errorHandler)

    wrapper = await mountComponent(getURL('email=test@okane.com&token=coolToken123'))
    await flushPromises()
  })

  test('does not render the loading state', () => {
    sharedAsserts.doesNotRenderTheLoadingState(wrapper)
  })

  test('does not render the "missing email" text', () => {
    sharedAsserts.doesNotRenderTheMissingEmailText(wrapper)
  })

  test('renders the VerifyEmailFailed component', () => {
    const component = wrapper.findComponent(VerifyEmailFailed)
    expect(component.exists()).toBe(true)
  })

  test('does not render the VerifyEmailSucceeded component', () => {
    sharedAsserts.doesNotRenderTheVerifyEmailSucceededComponent(wrapper)
  })
})

describe('when verification succeeds', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    const successHandler = http.post(getMswUrl(authApiRoutes.verifyEmail()), () =>
      HttpResponse.json({}, { status: HTTP_STATUS_CODE.OK_200 }),
    )
    testServer.use(successHandler)

    wrapper = await mountComponent(getURL('email=test@okane.com&token=coolToken123'))
    await flushPromises()
    await flushPromises()
  })

  test('does not render the loading state', () => {
    sharedAsserts.doesNotRenderTheLoadingState(wrapper)
  })

  test('does not render the "missing email" text', () => {
    sharedAsserts.doesNotRenderTheMissingEmailText(wrapper)
  })

  test('does not render the VerifyEmailFailed component', () => {
    sharedAsserts.doesNotRenderTheVerifyEmailFailedComponent(wrapper)
  })

  test('renders the VerifyEmailSucceeded component', () => {
    const component = wrapper.findComponent(VerifyEmailSucceeded)
    expect(component.exists()).toBe(true)
  })
})
