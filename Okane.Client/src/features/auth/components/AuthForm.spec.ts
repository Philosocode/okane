// External
import { h } from 'vue'

import { type VueWrapper } from '@vue/test-utils'

// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'

const mountComponent = getMountComponent(AuthForm)
const props = {
  submitButtonText: 'Hello world',
  submitError: 'Something exploded',
  submitSuccess: '',
}

test('renders a submit button', () => {
  const wrapper = mountComponent({ props })
  const submitButton = wrapper.get('button[type="submit"]')
  expect(submitButton.attributes('disabled')).toBeUndefined()
  expect(submitButton.text()).toBe(props.submitButtonText)
})

test('renders the default slot content', () => {
  const slotText = 'Hello slot 1234'
  const wrapper = mountComponent({
    props,
    slots: {
      default: () => h('p', slotText),
    },
  })
  const text = wrapper.findByText('p', slotText)
  expect(text).toBeDefined()
})

test('renders the footer slot content', () => {
  const slotText = 'Hello slot 1234'
  const wrapper = mountComponent({
    props,
    slots: {
      footer: () => h('p', slotText),
    },
  })
  const text = wrapper.findByText('p', slotText)
  expect(text).toBeDefined()
})

test('renders a submit error', () => {
  const wrapper = mountComponent({ props })
  const error = wrapper.findByText('p', props.submitError)
  expect(error).toBeDefined()
})

test('emits a submit event', async () => {
  const wrapper = mountComponent({ props })
  const submitButton = wrapper.get('button[type="submit"]')
  await submitButton.trigger('submit')
  expect(wrapper.emitted('submit')).toBeDefined()
})

describe('when submitButtonIsDisabled is true', () => {
  test('renders a disabled submit button', () => {
    const wrapper = mountComponent({
      props: {
        ...props,
        submitButtonIsDisabled: true,
      },
    })
    const submitButton = wrapper.get('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })
})

describe('with both a submitError and submitSuccess', () => {
  const submitSuccess = 'Successfully succeeded'

  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mountComponent({
      props: { ...props, submitSuccess },
    })
  })

  test('renders an error', () => {
    const error = wrapper.findByText('p', props.submitError)
    expect(error).toBeDefined()
  })

  test('does not render a success message', () => {
    const error = wrapper.findByText('p', submitSuccess)
    expect(error).toBeUndefined()
  })
})

describe('with a submitSuccess and no submitError', () => {
  const submitSuccess = 'Successfully succeeded'

  let wrapper: VueWrapper
  beforeEach(() => {
    wrapper = mountComponent({
      props: { ...props, submitError: '', submitSuccess },
    })
  })

  test('renders a success message', () => {
    const error = wrapper.findByText('p', props.submitSuccess)
    expect(error).toBeDefined()
  })
})
