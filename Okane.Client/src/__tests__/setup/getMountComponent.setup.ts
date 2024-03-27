// External
import type { Plugin } from 'vue'
import type { Router } from 'vue-router'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { mount, type ComponentMountingOptions } from '@vue/test-utils'

// Internal
import { createAppRouter } from '@shared/services/router/router.service'

global.getMountComponent = customMount

declare global {
  // @ts-ignore
  // eslint-disable-next-line no-var
  var getMountComponent: typeof customMount
}

let pinia: Pinia

beforeEach(() => {
  pinia = createPinia()
  setActivePinia(pinia)
})

type CustomMountingOptions = {
  withPinia?: boolean | Pinia
  withRouter?: boolean | Router
}

type MountingOptionsWithPlugins<TComponent> = ComponentMountingOptions<TComponent> & {
  // For convenience, plugins can be passed directly rather than through global.plugins.
  plugins?: Plugin[]
}

/**
 * Returns `mount` with the first argument set to a component.
 *
 * @param component
 * @param customOptions
 */
function customMount<TComponent>(component: TComponent, customOptions?: CustomMountingOptions) {
  return function (options?: MountingOptionsWithPlugins<TComponent>) {
    const mergedGlobal: ComponentMountingOptions<TComponent>['global'] = {
      ...options?.global,
    }

    if (!Array.isArray(mergedGlobal.plugins)) {
      mergedGlobal.plugins = []
    }

    if (Array.isArray(options?.plugins)) {
      mergedGlobal.plugins.push(...options.plugins)
    }

    if (customOptions?.withRouter) {
      let routerToUse: Router

      if (typeof customOptions.withRouter === 'boolean') {
        routerToUse = createAppRouter()
      } else {
        routerToUse = customOptions.withRouter
      }

      mergedGlobal.plugins.push(routerToUse)
    }

    if (customOptions?.withPinia) {
      let piniaToUse = pinia

      if (typeof customOptions?.withPinia !== 'boolean') {
        piniaToUse = customOptions.withPinia
      }

      mergedGlobal.plugins.push(piniaToUse)
    }

    return mount(component, {
      ...options,
      global: mergedGlobal,
    })
  }
}
