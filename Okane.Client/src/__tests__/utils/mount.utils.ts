// External
import type { Plugin } from 'vue'
import { type ComponentMountingOptions, mount } from '@vue/test-utils'

// Internal
import { createAppRouter } from '@/shared/services/router/router.service'

type GlobalMountOptions<T> = ComponentMountingOptions<T>['global']

type CustomMountingOptions = {
  withPinia?: boolean
  withRouter?: boolean
}

type MountingOptionsWithPlugins<TComponent> = ComponentMountingOptions<TComponent> & {
  plugins?: Plugin[]
}

/**
 * Returns `mount` with the first argument set to a component.
 *
 * @param component
 * @param customOptions
 */
export function getMountComponent<TComponent>(
  component: TComponent,
  customOptions?: CustomMountingOptions,
) {
  return function (options?: MountingOptionsWithPlugins<TComponent>) {
    const mergedGlobal: GlobalMountOptions<TComponent> = {
      ...options?.global,
    }

    if (!Array.isArray(mergedGlobal.plugins)) {
      mergedGlobal.plugins = []
    }

    if (Array.isArray(options?.plugins)) {
      mergedGlobal.plugins.push(...options.plugins)
    }

    if (customOptions?.withRouter) {
      mergedGlobal.plugins.push(createAppRouter())
    }

    if (customOptions?.withPinia && globalThis.pinia) {
      mergedGlobal.plugins.push(globalThis.pinia)
    }

    return mount(component, {
      ...options,
      global: mergedGlobal,
    })
  }
}
