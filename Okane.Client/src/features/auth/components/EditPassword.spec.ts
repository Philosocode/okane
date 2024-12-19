// External
import { http, HttpResponse } from 'msw'

import { flushPromises, type VueWrapper } from '@vue/test-utils'

// Internal
import EditPassword from '@features/auth/components/EditPassword.vue'
import PasswordRequirements from '@features/auth/components/PasswordRequirements.vue'

import { authAPIRoutes } from '@features/auth/constants/apiRoutes'
import { AUTH_COPY } from '@features/auth/constants/copy'
import { HTTP_STATUS_CODE } from '@shared/constants/http'
import { BUTTON_TYPE, INPUT_TYPE } from '@shared/constants/form'

import { createTestPasswordRequirements } from '@tests/factories/authForm'
import { createTestProblemDetails } from '@tests/factories/problemDetails'
import { getMSWURL } from '@tests/utils/url'
import { testServer } from '@tests/msw/testServer'

const requirements = createTestPasswordRequirements()

const mountComponent = getMountComponent(EditPassword, {
  props: {
    requirements,
  },
  withPinia: true,
  withQueryClient: true,
})

const elements = {
  currentPasswordInput(wrapper: VueWrapper) {
    return wrapper.get('input[name="currentPassword"]')
  },
  newPasswordInput(wrapper: VueWrapper) {
    return wrapper.get('input[name="newPassword"]')
  },
  newPasswordConfirmInput(wrapper: VueWrapper) {
    return wrapper.get('input[name="newPasswordConfirm"]')
  },
  saveButton(wrapper: VueWrapper) {
    return wrapper.get(`button[type="${BUTTON_TYPE.SUBMIT}"]`)
  },
}

const validPassword = 'aA1!'.repeat(requirements.minLength)

const validInputValues = {
  currentPassword: validPassword,
  newPassword: validPassword,
  newPasswordConfirm: validPassword,
}

const asserts = {
  disablesSaveButton(wrapper: VueWrapper) {
    const button = elements.saveButton(wrapper)
    expect(button.attributes('disabled')).toBeDefined()
  },
  rendersPasswordRequirements(wrapper: VueWrapper) {
    const requirements = wrapper.findComponent(PasswordRequirements)
    expect(requirements.exists()).toBe(true)
  },
  doesNotRenderPasswordRequirements(wrapper: VueWrapper) {
    const requirements = wrapper.findComponent(PasswordRequirements)
    expect(requirements.exists()).toBe(false)
  },
  doesNotRenderSuccessMessage(wrapper: VueWrapper) {
    const error = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.EDIT_PASSWORD_SUCCESS)
    expect(error).toBeUndefined()
  },
  doesNotRenderInvalidCurrentPasswordError(wrapper: VueWrapper) {
    const error = wrapper.findByText(
      'p',
      AUTH_COPY.ACCOUNT_PAGE.EDIT_PASSWORD_ERROR_CURRENT_PASSWORD_INVALID,
    )
    expect(error).toBeUndefined()
  },
  doesNotRenderGeneralSubmitError(wrapper: VueWrapper) {
    const error = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.EDIT_PASSWORD_ERROR_GENERAL)
    expect(error).toBeUndefined()
  },
}

const helpers = {
  async populateInputs(args: {
    wrapper: VueWrapper
    currentPassword?: string
    newPassword?: string
    newPasswordConfirm?: string
  }) {
    const { wrapper, currentPassword, newPassword, newPasswordConfirm } = args

    if (currentPassword) {
      const input = elements.currentPasswordInput(wrapper)
      await input.setValue(currentPassword)
    }

    if (newPassword) {
      const input = elements.newPasswordInput(wrapper)
      await input.setValue(newPassword)
    }

    if (newPasswordConfirm) {
      const input = elements.newPasswordConfirmInput(wrapper)
      await input.setValue(newPasswordConfirm)
    }
  },
  async submitForm(wrapper: VueWrapper) {
    const saveButton = elements.saveButton(wrapper)
    await saveButton.trigger('submit')
    await flushPromises()
  },
}

test('renders a heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.findByText('h2', AUTH_COPY.ACCOUNT_PAGE.EDIT_PASSWORD)
  expect(heading).toBeDefined()
})

// Renders inputs and labels.
test.each([
  {
    getInput: (wrapper: VueWrapper) => elements.currentPasswordInput(wrapper),
    inputName: 'current password',
    label: AUTH_COPY.ACCOUNT_PAGE.CURRENT_PASSWORD,
  },
  {
    getInput: (wrapper: VueWrapper) => elements.newPasswordInput(wrapper),
    inputName: 'new password',
    label: AUTH_COPY.ACCOUNT_PAGE.NEW_PASSWORD,
  },
  {
    getInput: (wrapper: VueWrapper) => elements.newPasswordConfirmInput(wrapper),
    inputName: 'new password confirm',
    label: AUTH_COPY.ACCOUNT_PAGE.NEW_PASSWORD_CONFIRM,
  },
])('renders a $inputName input', (args) => {
  const wrapper = mountComponent()
  const input = args.getInput(wrapper)
  expect(input.attributes('type')).toBe(INPUT_TYPE.PASSWORD)

  const label = wrapper.findByText('label', args.label)
  expect(label).toBeDefined()
})

test('does not render the password requirements', () => {
  const wrapper = mountComponent()
  asserts.doesNotRenderPasswordRequirements(wrapper)
})

test('renders a disabled save button', () => {
  const wrapper = mountComponent()
  const button = elements.saveButton(wrapper)
  expect(button.attributes('disabled')).toBeDefined()
})

test('does not render a success message', () => {
  const wrapper = mountComponent()
  asserts.doesNotRenderSuccessMessage(wrapper)
})

test('does not render an invalid current password error', () => {
  const wrapper = mountComponent()
  asserts.doesNotRenderInvalidCurrentPasswordError(wrapper)
})

test('does not render a general submit error', () => {
  const wrapper = mountComponent()
  asserts.doesNotRenderGeneralSubmitError(wrapper)
})

test.each([
  {
    getInput: (wrapper: VueWrapper) => elements.currentPasswordInput(wrapper),
    inputName: 'current password',
  },
  {
    getInput: (wrapper: VueWrapper) => elements.newPasswordInput(wrapper),
    inputName: 'new password',
  },
  {
    getInput: (wrapper: VueWrapper) => elements.newPasswordConfirmInput(wrapper),
    inputName: 'new password confirm',
  },
])('renders password requirements when $inputName is not empty', async (args) => {
  const wrapper = mountComponent()
  const input = args.getInput(wrapper)
  await input.setValue('blah')

  asserts.rendersPasswordRequirements(wrapper)
})

describe('when currentPassword is missing', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent()

    await helpers.populateInputs({
      wrapper,
      ...validInputValues,
      currentPassword: '',
    })
  })

  test('disables the submit button', () => {
    asserts.disablesSaveButton(wrapper)
  })

  test('does not render the password requirements', () => {
    asserts.doesNotRenderPasswordRequirements(wrapper)
  })
})

describe('when newPassword is missing', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent()

    await helpers.populateInputs({
      wrapper,
      ...validInputValues,
      newPassword: '',
    })
  })

  test('disables the submit button', () => {
    asserts.disablesSaveButton(wrapper)
  })

  test('renders the password requirements', () => {
    asserts.rendersPasswordRequirements(wrapper)
  })
})

describe('when newPasswordConfirm is missing', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent()

    await helpers.populateInputs({
      wrapper,
      ...validInputValues,
      newPassword: '',
    })
  })

  test('disables the submit button', () => {
    asserts.disablesSaveButton(wrapper)
  })

  test('renders the password requirements', () => {
    asserts.rendersPasswordRequirements(wrapper)
  })
})

describe('when inputs are populated but form is invalid', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent()

    await helpers.populateInputs({
      wrapper,
      newPassword: 'abc',
      currentPassword: 'abc',
      newPasswordConfirm: 'abc',
    })
  })

  test('disables the submit button', () => {
    asserts.disablesSaveButton(wrapper)
  })

  test('renders the password requirements', () => {
    asserts.rendersPasswordRequirements(wrapper)
  })
})

describe('when form is valid', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    wrapper = mountComponent()
    await helpers.populateInputs({ wrapper, ...validInputValues })
  })

  test('enables the submit button', async () => {
    const button = elements.saveButton(wrapper)
    expect(button.attributes('disabled')).toBeUndefined()
  })

  test('does not render the password requirements', async () => {
    asserts.doesNotRenderPasswordRequirements(wrapper)
  })
})

describe('when the patch request succeeds', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    const handler = http.patch(getMSWURL(authAPIRoutes.self()), () =>
      HttpResponse.json({}, { status: HTTP_STATUS_CODE.OK_200 }),
    )
    testServer.use(handler)

    wrapper = mountComponent()

    await helpers.populateInputs({ wrapper, ...validInputValues })
    await helpers.submitForm(wrapper)
  })

  test('renders a success message', () => {
    const message = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.EDIT_PASSWORD_SUCCESS)
    expect(message).toBeDefined()
  })

  test('does not render an invalid current password error', () => {
    asserts.doesNotRenderInvalidCurrentPasswordError(wrapper)
  })

  test('does not render a general submit error', () => {
    asserts.doesNotRenderGeneralSubmitError(wrapper)
  })

  describe.each([
    {
      getInput: (wrapper: VueWrapper) => elements.currentPasswordInput(wrapper),
      inputName: 'current password',
    },
    {
      getInput: (wrapper: VueWrapper) => elements.newPasswordInput(wrapper),
      inputName: 'new password',
    },
    {
      getInput: (wrapper: VueWrapper) => elements.newPasswordConfirmInput(wrapper),
      inputName: 'new password confirm',
    },
  ])('when updating the $inputName input', (args) => {
    beforeEach(async () => {
      const input = args.getInput(wrapper)
      await input.setValue('abc')
    })

    test('clears the success message', () => {
      asserts.doesNotRenderSuccessMessage(wrapper)
    })
  })
})

describe('when current password is invalid', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    const problemDetails = createTestProblemDetails({
      errors: {
        PasswordMismatch: ['Invalid password'],
      },
    })
    const handler = http.patch(getMSWURL(authAPIRoutes.self()), () =>
      HttpResponse.json(problemDetails, { status: HTTP_STATUS_CODE.BAD_REQUEST_400 }),
    )
    testServer.use(handler)

    wrapper = mountComponent()

    await helpers.populateInputs({ wrapper, ...validInputValues })
    await helpers.submitForm(wrapper)
  })

  test('renders an invalid current password error', () => {
    const error = wrapper.findByText(
      'p',
      AUTH_COPY.ACCOUNT_PAGE.EDIT_PASSWORD_ERROR_CURRENT_PASSWORD_INVALID,
    )
    expect(error).toBeDefined()
  })

  test('does not render a success message', () => {
    asserts.doesNotRenderSuccessMessage(wrapper)
  })

  test('does not render a general submit error', () => {
    asserts.doesNotRenderGeneralSubmitError(wrapper)
  })
})

describe('when current password is valid but the patch request fails', () => {
  let wrapper: VueWrapper

  beforeEach(async () => {
    const handler = http.patch(getMSWURL(authAPIRoutes.self()), () =>
      HttpResponse.json(createTestProblemDetails(), { status: HTTP_STATUS_CODE.BAD_REQUEST_400 }),
    )
    testServer.use(handler)

    wrapper = mountComponent()

    await helpers.populateInputs({ wrapper, ...validInputValues })
    await helpers.submitForm(wrapper)
  })

  test('renders an invalid general submit error', () => {
    const error = wrapper.findByText('p', AUTH_COPY.ACCOUNT_PAGE.EDIT_PASSWORD_ERROR_GENERAL)
    expect(error).toBeDefined()
  })

  test('does not render a success message', () => {
    asserts.doesNotRenderSuccessMessage(wrapper)
  })

  test('does not render an invalid current password error', () => {
    asserts.doesNotRenderInvalidCurrentPasswordError(wrapper)
  })
})
