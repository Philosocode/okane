// External
import { type VueWrapper } from '@vue/test-utils'

// Internal
import Heading from '@shared/components/Heading.vue'
import SendResetPasswordEmailForm from '@features/auth/components/SendResetPasswordEmailForm.vue'
import SendResetPasswordEmailPage from '@shared/pages/SendResetPasswordEmailPage.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

const mountComponent = getMountComponent(SendResetPasswordEmailPage, {
  global: {
    stubs: {
      SendResetPasswordEmailForm: true,
    },
  },
})

test('renders a SendResetPasswordEmailForm', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(SendResetPasswordEmailForm).exists()).toBe(true)
})

test('does not render the success text', () => {
  const wrapper = mountComponent()
  expect(wrapper.findComponent(Heading).exists()).toBe(false)
  expect(wrapper.findByText('p', AUTH_COPY.SEND_RESET_PASSWORD_EMAIL.SUCCESS.BODY)).toBeUndefined()
})

describe('when the email is successfully sent', () => {
  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mountComponent()

    const form = wrapper.findComponent(SendResetPasswordEmailForm)
    form.vm.$emit('success')
  })

  test('does not render a SendResetPasswordEmailForm', () => {
    expect(wrapper.findComponent(SendResetPasswordEmailForm).exists()).toBe(false)
  })

  test('renders the success text', () => {
    expect(wrapper.findComponent(Heading).exists()).toBe(true)
    expect(wrapper.findByText('p', AUTH_COPY.SEND_RESET_PASSWORD_EMAIL.SUCCESS.BODY)).toBeDefined()
  })
})
