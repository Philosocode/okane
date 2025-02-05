// External
import { type VueWrapper } from '@vue/test-utils'

// Internal
import CardHeading from '@shared/components/typography/CardHeading.vue'
import PasswordRequirements from '@features/auth/components/PasswordRequirements.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import { type PasswordChecks } from '@features/auth/types/authForm'

const mountComponent = getMountComponent(PasswordRequirements)
const minPasswordLength = 12
const checks: PasswordChecks = {
  invalidPasswordConfirm: true,
  missingNonAlphanumeric: true,
  missingDigit: true,
  missingUppercase: true,
  insufficientLength: true,
  missingLowercase: true,
}

const sharedAsserts = {
  rendersLiWithText(wrapper: VueWrapper, text: string) {
    const li = wrapper.findByText('li', text)
    expect(li).toBeDefined()
  },
  doesNotRenderLiWithText(wrapper: VueWrapper, text: string) {
    const li = wrapper.findByText('li', text)
    expect(li).toBeUndefined()
  },
}

test('renders the heading', () => {
  const wrapper = mountComponent({
    props: { checks, minPasswordLength },
  })
  const heading = wrapper.getComponent(CardHeading)
  expect(heading.text()).toBe(AUTH_COPY.PASSWORD_REQUIREMENTS.HEADING)
})

test('renders the "insufficient length" text', () => {
  const wrapper = mountComponent({
    props: { checks, minPasswordLength },
  })
  sharedAsserts.rendersLiWithText(
    wrapper,
    AUTH_COPY.PASSWORD_REQUIREMENTS.LABELS.MIN_LENGTH(minPasswordLength),
  )
})

describe('with a sufficient password length', () => {
  it('does not render the "insufficient length" text', () => {
    const wrapper = mountComponent({
      props: {
        checks: { ...checks, insufficientLength: false },
        minPasswordLength,
      },
    })
    sharedAsserts.doesNotRenderLiWithText(
      wrapper,
      AUTH_COPY.PASSWORD_REQUIREMENTS.LABELS.MIN_LENGTH(minPasswordLength),
    )
  })
})

test('renders the "missing uppercase letter" text', () => {
  const wrapper = mountComponent({
    props: { checks, minPasswordLength },
  })
  sharedAsserts.rendersLiWithText(wrapper, AUTH_COPY.PASSWORD_REQUIREMENTS.LABELS.UPPERCASE_LETTER)
})

describe('with an uppercase letter', () => {
  it('does not render the "missing uppercase letter" text', () => {
    const wrapper = mountComponent({
      props: {
        checks: { ...checks, missingUppercase: false },
        minPasswordLength,
      },
    })
    sharedAsserts.doesNotRenderLiWithText(
      wrapper,
      AUTH_COPY.PASSWORD_REQUIREMENTS.LABELS.UPPERCASE_LETTER,
    )
  })
})

test('renders the "missing lowercase letter" text', () => {
  const wrapper = mountComponent({
    props: { checks, minPasswordLength },
  })
  sharedAsserts.rendersLiWithText(wrapper, AUTH_COPY.PASSWORD_REQUIREMENTS.LABELS.LOWERCASE_LETTER)
})

describe('with a lowercase letter', () => {
  it('does not render the "missing lowercase letter" text', () => {
    const wrapper = mountComponent({
      props: {
        checks: { ...checks, missingLowercase: false },
        minPasswordLength,
      },
    })
    sharedAsserts.doesNotRenderLiWithText(
      wrapper,
      AUTH_COPY.PASSWORD_REQUIREMENTS.LABELS.LOWERCASE_LETTER,
    )
  })
})

test('renders the "missing digit" text', () => {
  const wrapper = mountComponent({
    props: { checks, minPasswordLength },
  })
  sharedAsserts.rendersLiWithText(wrapper, AUTH_COPY.PASSWORD_REQUIREMENTS.LABELS.DIGIT)
})

describe('with a digit letter', () => {
  it('does not render the "missing digit" text', () => {
    const wrapper = mountComponent({
      props: {
        checks: { ...checks, missingDigit: false },
        minPasswordLength,
      },
    })
    sharedAsserts.doesNotRenderLiWithText(wrapper, AUTH_COPY.PASSWORD_REQUIREMENTS.LABELS.DIGIT)
  })
})

test('renders the "missing non-alphanumeric symbol" text', () => {
  const wrapper = mountComponent({
    props: { checks, minPasswordLength },
  })
  sharedAsserts.rendersLiWithText(
    wrapper,
    AUTH_COPY.PASSWORD_REQUIREMENTS.LABELS.NON_ALPHANUMERIC_SYMBOL,
  )
})

describe('with a non-alphanumeric symbol', () => {
  it('does not render the "missing non-alphanumeric symbol" text', () => {
    const wrapper = mountComponent({
      props: {
        checks: { ...checks, missingNonAlphanumeric: false },
        minPasswordLength,
      },
    })
    sharedAsserts.doesNotRenderLiWithText(
      wrapper,
      AUTH_COPY.PASSWORD_REQUIREMENTS.LABELS.NON_ALPHANUMERIC_SYMBOL,
    )
  })
})

test('renders the "invalid password confirm" text', () => {
  const wrapper = mountComponent({
    props: { checks, minPasswordLength },
  })
  sharedAsserts.rendersLiWithText(
    wrapper,
    AUTH_COPY.PASSWORD_REQUIREMENTS.LABELS.MATCHING_PASSWORDS,
  )
})

describe('with a valid password confirm', () => {
  it('does not render the "invalid password confirm" text', () => {
    const wrapper = mountComponent({
      props: {
        checks: { ...checks, invalidPasswordConfirm: false },
        minPasswordLength,
      },
    })
    sharedAsserts.doesNotRenderLiWithText(
      wrapper,
      AUTH_COPY.PASSWORD_REQUIREMENTS.LABELS.MATCHING_PASSWORDS,
    )
  })
})
