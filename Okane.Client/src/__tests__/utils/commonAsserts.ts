// External
import { type DOMWrapper, type VueWrapper } from '@vue/test-utils'

// Internal
import { type SelectOption } from '@shared/components/form/FormSelect.vue'

export const commonAsserts = {
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