// External
import { type DOMWrapper, type VueWrapper } from '@vue/test-utils'

// Internal
import CardHeading from '@shared/components/typography/CardHeading.vue'

import { ARIA_ATTRIBUTES } from '@shared/constants/aria'
import { TEST_IDS } from '@shared/constants/testIds'

import { type SelectOption } from '@shared/components/form/FormSelect.vue'

export const commonAsserts = {
  rendersAnAccessibleModal({
    wrapper,
    selector = `[data-testid="${TEST_IDS.MODAL}"]`,
  }: {
    wrapper: VueWrapper
    selector?: string
  }) {
    const modal = wrapper.get(selector)
    const dialogLabelledBy = modal.attributes(ARIA_ATTRIBUTES.LABELLED_BY)
    const heading = modal.getComponent(CardHeading)
    expect(heading.attributes('id')).toBe(dialogLabelledBy)
  },
  rendersExpectedSelectOptions(args: {
    expectedOptions: SelectOption[]
    select: Omit<DOMWrapper<Element>, 'exists'>
  }) {
    const options = args.select.findAll('option')
    const actualOptions: Record<string, SelectOption> = {}

    options.forEach((option) => {
      const label = option.text()
      const value = option.attributes('value') ?? ''

      actualOptions[value] = { label, value }
    })

    expect(Object.keys(args.expectedOptions)).toHaveLength(Object.keys(actualOptions).length)

    args.expectedOptions.forEach((expectedOption) => {
      const actualOption = actualOptions[expectedOption.value]

      expect(actualOption.value).toBe(actualOption.value)

      if (expectedOption.label) {
        expect(actualOption.label).toBe(expectedOption.label)
      }
    })
  },
  rendersElementWithTestId(args: { testId: string; wrapper: VueWrapper }) {
    const element = args.wrapper.find(`[data-testid="${args.testId}"]`)
    expect(element.exists()).toBe(true)
  },
}
