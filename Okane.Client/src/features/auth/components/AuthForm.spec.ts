// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import { type AuthFormType } from '@features/auth/types/authForm'

import { capitalize } from '@shared/utils/string'

const mountComponent = getMountComponent(AuthForm)

makeFormAssertions('login')
makeFormAssertions('register')

function makeFormAssertions(formType: AuthFormType) {
  describe(`${capitalize(formType)} form`, () => {
    const props = { props: { formType } } as const

    test('renders the expected form controls', () => {
      const wrapper = mountComponent(props)
      const emailInput = wrapper.get('input[name="email"]')
      expect(emailInput.attributes('type')).toBe('email')
      expect(wrapper.findByText('label', AUTH_COPY.AUTH_FORM.EMAIL)).toBeTruthy()

      const passwordInput = wrapper.get('input[name="password"]')
      expect(passwordInput.attributes('type')).toBe('password')
      expect(wrapper.findByText('label', AUTH_COPY.AUTH_FORM.PASSWORD)).toBeTruthy()

      if (formType === 'login') {
        expect(wrapper.find('input[name="name"]').exists()).toBe(false)
        expect(wrapper.find('input[name="passwordConfirm"]').exists()).toBe(false)
        return
      }

      const nameInput = wrapper.get('input[name="name')
      expect(nameInput.attributes('type')).toBe('text')
      expect(wrapper.findByText('label', AUTH_COPY.AUTH_FORM.NAME)).toBeTruthy()

      const passwordConfirmInput = wrapper.get('input[name="passwordConfirm"]')
      expect(passwordConfirmInput.attributes('type')).toBe('password')
      expect(wrapper.findByText('label', AUTH_COPY.AUTH_FORM.CONFIRM_PASSWORD)).toBeTruthy()
    })

    test(`renders a disabled ${formType} button`, () => {
      const wrapper = mountComponent(props)
      const submitButton = wrapper.get('button[type="submit"')
      expect(submitButton.text()).toBe(capitalize(formType))

      // For disabled elements, the presence of the attribute suggests that the element is disabled.
      expect(submitButton.attributes()).toHaveProperty('disabled')
    })

    test('submits the form', async () => {
      const wrapper = mountComponent(props)
      const submitButton = wrapper.get('button[type="submit"]')

      const formData = {
        email: 'test@okane.com',
        password: 'coolPassword132',

        // Only used in register form.
        name: 'Okane',
      }

      const emailInput = wrapper.get('input[name="email"]')
      await emailInput.setValue(formData.email)
      expect(submitButton.attributes()).toHaveProperty('disabled')

      const passwordInput = wrapper.get('input[name="password"]')
      await passwordInput.setValue(formData.password)

      if (formType === 'register') {
        const nameInput = wrapper.get('input[name="name"]')
        await nameInput.setValue(formData.name)
        expect(submitButton.attributes()).toHaveProperty('disabled')

        const passwordConfirmInput = wrapper.get('input[name="passwordConfirm"]')
        await passwordConfirmInput.setValue(formData.password)
        expect(submitButton.attributes()).toHaveProperty('disabled')

        // For the register form, it's not just enough to have a password. That password has to be valid.
        formData.password = '!!!CoolPassword12345!!!'
        await passwordInput.setValue(formData.password)
        expect(submitButton.attributes()).toHaveProperty('disabled')

        await passwordConfirmInput.setValue(formData.password)
      }

      expect(submitButton.attributes()).not.toHaveProperty('disabled')

      await submitButton.trigger('submit')

      const formSubmissions = wrapper.emitted('submit')
      expect(formSubmissions).toHaveLength(1)

      const submission = formSubmissions?.[0][0]

      const expectedData: Record<string, string> = {
        email: formData.email,
        password: formData.password,
      }
      if (formType === 'register') {
        expectedData.name = formData.name
        expectedData.passwordConfirm = formData.password
      }

      expect(submission).toEqual(expect.objectContaining(expectedData))
    })
  })
}
