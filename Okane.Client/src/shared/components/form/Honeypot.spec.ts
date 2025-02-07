// Internal
import Honeypot from '@shared/components/form/Honeypot.vue'

import { HONEYPOT_INPUT_NAME } from '@shared/constants/form'
import { SHARED_COPY } from '@shared/constants/copy'

import * as formUtils from '@shared/utils/form'

const mountComponent = getMountComponent(Honeypot)

const formControlId = '1'

beforeEach(() => {
  vitest.spyOn(formUtils, 'getUniqueFormControlId').mockReturnValue(formControlId)
})

test('renders an input with the expected attributes', () => {
  const wrapper = mountComponent()
  const input = wrapper.get('input')
  expect(input.attributes()).toEqual(
    expect.objectContaining({
      autocomplete: 'nope',
      id: formControlId,
      name: HONEYPOT_INPUT_NAME,
      tabindex: '-1',
      type: 'text',
    }),
  )
})

test('renders a label', () => {
  const wrapper = mountComponent()
  const label = wrapper.get('label')
  expect(label.text()).toBe(SHARED_COPY.NOUNS.CITY)
  expect(label.attributes('for')).toBe(formControlId)
})
