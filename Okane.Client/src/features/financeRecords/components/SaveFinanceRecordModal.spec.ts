// Internal
import ModalHeading from '@shared/components/modal/ModalHeading.vue'
import SaveFinanceRecordFormInputs from '@features/financeRecords/components/SaveFinanceRecordFormInputs.vue'
import SaveFinanceRecordModal from '@features/financeRecords/components/SaveFinanceRecordModal.vue'

import { FINANCE_RECORD_MIN_AMOUNT } from '@features/financeRecords/constants/saveFinanceRecord'
import { SHARED_COPY } from '@shared/constants/copy'

import { getInitialFormErrors } from '@shared/utils/form'

import { commonAsserts } from '@tests/utils/commonAsserts'
import { createTestSaveFinanceRecordFormState } from '@tests/factories/financeRecord'

const formState = createTestSaveFinanceRecordFormState()
const props = {
  formErrors: {
    ...getInitialFormErrors(formState),
    amount: 'Amount error',
    description: 'Description error',
  },
  formState,
  isShowing: true,
  title: 'Cool Modal Title',
}

const mountComponent = getMountComponent(SaveFinanceRecordModal, {
  global: {
    stubs: {
      teleport: true,
    },
  },
  props,
  withQueryClient: true,
})

test('does not render the modal content when isShowing is false', () => {
  const wrapper = mountComponent({
    props: {
      isShowing: false,
    },
  })

  const heading = wrapper.findComponent(ModalHeading)
  expect(heading.exists()).toBe(false)
})

test('renders the modal heading', () => {
  const wrapper = mountComponent()
  const heading = wrapper.getComponent(ModalHeading)
  expect(heading.text()).toBe(props.title)
})

test('renders an accessible dialog', () => {
  const wrapper = mountComponent()
  commonAsserts.rendersAnAccessibleDialog({ dialog: wrapper.get('dialog') })
})

test('renders the form inputs', () => {
  const wrapper = mountComponent()
  const inputs = wrapper.findComponent(SaveFinanceRecordFormInputs)
  expect(inputs.exists()).toBe(true)
})

test('renders a button to submit the form', async () => {
  const wrapper = mountComponent()
  const submitButton = wrapper.find("button[type='submit'")
  expect(submitButton.exists()).toBe(true)
})

test('renders a button to close the modal', async () => {
  const wrapper = mountComponent()
  expect(wrapper.emitted('close')).toBeUndefined()

  const closeButton = wrapper.findByText('button', SHARED_COPY.ACTIONS.CANCEL)
  await closeButton.trigger('click')
  expect(wrapper.emitted('close')).toBeDefined()
})

test('renders the form errors', () => {
  const wrapper = mountComponent()
  const amountError = wrapper.findByText('p', props.formErrors.amount)
  expect(amountError).toBeDefined()

  const descriptionError = wrapper.findByText('p', props.formErrors.description)
  expect(descriptionError).toBeDefined()
})

test('emits a "change" event when an input is updated', async () => {
  const wrapper = mountComponent()
  expect(wrapper.emitted('change')).toBeUndefined()

  const updates = { amount: 1, description: '2' }
  const formInputs = wrapper.getComponent(SaveFinanceRecordFormInputs)
  formInputs.vm.$emit('change', updates)
  expect(wrapper.emitted('change')).toEqual([[updates]])
})

describe('when clicking the submit button', () => {
  test('emits a "submit" event', async () => {
    const wrapper = mountComponent()
    expect(wrapper.emitted('submit')).toBeUndefined()

    const submitButton = wrapper.get("button[type='submit']")
    await submitButton.trigger('click')
    expect(wrapper.emitted('submit')).toBeDefined()
  })

  test.todo('resets the form errors', () => {})

  test('does not emit a "submit" event when the form state is invalid', async () => {
    const wrapper = mountComponent({
      props: {
        formState: {
          ...props.formState,
          amount: FINANCE_RECORD_MIN_AMOUNT - 1,
        },
      },
    })
    const submitButton = wrapper.get("button[type='submit']")
    await submitButton.trigger('click')
    expect(wrapper.emitted('submit')).toBeUndefined()
  })
})
