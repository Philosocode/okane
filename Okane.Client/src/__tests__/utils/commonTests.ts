import type { VueWrapper } from '@vue/test-utils'

export const commonTests = {
  rendersElementWithTestId(args: {
    testName: string
    testId: string
    getWrapper: () => VueWrapper
  }) {
    test(args.testName, () => {
      const wrapper = args.getWrapper()
      const element = wrapper.find(`[data-testid="${args.testId}"]`)
      expect(element.exists()).toBe(true)
    })
  },
}
