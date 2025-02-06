// External
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { http, type HttpHandler, HttpResponse } from 'msw'

// Internal
import Loader from '@shared/components/loader/Loader.vue'
import VerifyEmailFailed from '@features/auth/components/verifyEmail/VerifyEmailFailed.vue'
import VerifyEmailPage from '@shared/pages/VerifyEmailPage.vue'
import VerifyEmailSucceeded from '@features/auth/components/verifyEmail/VerifyEmailSucceeded.vue'

import { authApiRoutes } from '@features/auth/constants/apiRoutes'
import { AUTH_COPY } from '@features/auth/constants/copy'
import { HTTP_STATUS_CODE } from '@shared/constants/http'
import { appRoutes, createAppRouter } from '@shared/services/router/router'

import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { getMswUrl } from '@tests/utils/url'
import { testServer } from '@tests/msw/testServer'

function getUrl(queryString: string = '') {
  let url = appRoutes.verifyEmail.buildPath()
  if (queryString) url += `?${queryString}`
  return url
}

async function mountComponent(url: string = getUrl()) {
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

const elements = {
  verifyButton(wrapper: VueWrapper) {
    return wrapper.findByText('button', AUTH_COPY.VERIFY_EMAIL.CLICK_TO_VERIFY)
  },
}

const sharedAsserts = {
  doesNotRenderTheLoadingState(wrapper: VueWrapper) {
    const loader = wrapper.findComponent(Loader)
    expect(loader.exists()).toBe(false)
  },
  doesNotRenderTheMissingEmailText(wrapper: VueWrapper) {
    const text = wrapper.findByText('p', AUTH_COPY.VERIFY_EMAIL.MISSING_EMAIL)
    expect(text).toBeUndefined()
  },
  doesNotRenderTheVerifyButton(wrapper: VueWrapper) {
    const button = elements.verifyButton(wrapper)
    expect(button).toBeUndefined()
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
  expect(wrapper.findByText('h1', AUTH_COPY.VERIFY_EMAIL.HEADING)).toBeDefined()
})

describe('when the email param is missing', () => {
  test('does not render a verify button', async () => {
    const wrapper = await mountComponent()
    sharedAsserts.doesNotRenderTheVerifyButton(wrapper)
  })

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
    wrapper = await mountComponent(getUrl('email=test@okane.com'))
  })

  test('does not render a verify button', async () => {
    const wrapper = await mountComponent()
    sharedAsserts.doesNotRenderTheVerifyButton(wrapper)
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

describe('with an email and token', () => {
  function setUp(handler?: HttpHandler) {
    if (handler) testServer.use(handler)

    const url = getUrl('email=test@okane.com&token=coolToken123')
    return mountComponent(url)
  }

  test('renders a verify button', async () => {
    const wrapper = await setUp()
    const button = wrapper.findByText('button', AUTH_COPY.VERIFY_EMAIL.CLICK_TO_VERIFY)
    expect(button).toBeDefined()
  })

  test('does not render the loading state', async () => {
    const wrapper = await setUp()
    sharedAsserts.doesNotRenderTheLoadingState(wrapper)
  })

  test('does not render the "missing email" text', async () => {
    const wrapper = await setUp()
    sharedAsserts.doesNotRenderTheMissingEmailText(wrapper)
  })

  test('does not render the VerifyEmailFailed component', async () => {
    const wrapper = await setUp()
    sharedAsserts.doesNotRenderTheVerifyEmailFailedComponent(wrapper)
  })

  test('does not render the VerifyEmailSucceeded component', async () => {
    const wrapper = await setUp()
    sharedAsserts.doesNotRenderTheVerifyEmailSucceededComponent(wrapper)
  })

  async function clickOnVerifyButton(wrapper: VueWrapper) {
    const verifyButton = elements.verifyButton(wrapper)
    await verifyButton.trigger('click')
    await flushPromises()
  }

  describe('when verification fails', () => {
    let wrapper: VueWrapper

    beforeEach(async () => {
      const errorHandler = http.post(getMswUrl(authApiRoutes.verifyEmail()), () =>
        HttpResponse.json(createTestProblemDetails(), {
          status: HTTP_STATUS_CODE.BAD_REQUEST_400,
        }),
      )

      wrapper = await setUp(errorHandler)
      await clickOnVerifyButton(wrapper)
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

      wrapper = await setUp(successHandler)
      await clickOnVerifyButton(wrapper)
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
})
