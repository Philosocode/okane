// External
import { type ComponentMountingOptions, mount } from '@vue/test-utils'

/**
 * Returns `mount` with the first argument set to a component.
 *
 * @param Component
 */
export function getMountComponent<TComponent>(Component: TComponent) {
  return function (options?: ComponentMountingOptions<TComponent>) {
    return mount(Component, options)
  }
}
