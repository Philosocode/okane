// Internal
import DeleteFinanceRecordModalActions from '@features/financeRecords/components/DeleteFinanceRecordModalActions.vue'

import { SHARED_COPY } from '@shared/constants/copy'

const mountComponent = getMountComponent(DeleteFinanceRecordModalActions)

function getProps() {
  return {
    handleClose: vi.fn(),
    handleDelete: vi.fn(),
  }
}

test('renders a focused button to delete the finance record', async () => {
  const props = getProps()
  const wrapper = mountComponent({
    attachTo: document.body,
    props,
  })
  const button = wrapper.findByText('button', SHARED_COPY.ACTIONS.DELETE)
  expect(button.element).toBe(document.activeElement)

  await button.trigger('click')
  expect(props.handleDelete).toHaveBeenCalledOnce()
})

test('renders a cancel button to close the delete modal', async () => {
  const props = getProps()
  const wrapper = mountComponent({ props })
  const button = wrapper.findByText('button', SHARED_COPY.ACTIONS.CANCEL)
  await button.trigger('click')
  expect(props.handleClose).toHaveBeenCalledOnce()
})
