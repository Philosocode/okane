// External
import merge from 'lodash.merge'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mount, type ComponentMountingOptions } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'

import type { Component, Plugin } from 'vue'
import type { Router } from 'vue-router'

// Internal
import { createAppRouter } from '@shared/services/router/router.service'

import '@shared/services/fontAwesome/fontAwesome.service'

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

type BaseMountingOptions = CustomMountingOptions & ComponentMountingOptions<Component>

/**
 * Returns `mount` with the first argument set to a component. Allows you to specify options that
 * are applied to each mount that can be overridden on a per-mount basis.
 *
 * @param component
 * @param baseOptions Options applied to all mounts. Can be overridden via perMountOptions
 * @return Function that accepts per-mount options and returns the mounted component wrapper.
 */
function customMount(component: Component, baseOptions?: BaseMountingOptions) {
  return function (perMountOptions?: ComponentMountingOptions<Component>) {
    const mergedOptions = merge(
      {
        global: {
          plugins: [] as Plugin[],
          stubs: { FontAwesomeIcon },
        },
      },
      baseOptions,
      perMountOptions,
    )

    mergedOptions.global?.plugins?.push(...populatePlugins(baseOptions))

    return mount(component, mergedOptions)
  }
}

function populatePlugins(customOptions?: CustomMountingOptions): Plugin[] {
  const plugins: Plugin[] = []

  if (customOptions?.withRouter) {
    let routerToUse = createAppRouter()

    if (typeof customOptions.withRouter !== 'boolean') {
      routerToUse = customOptions.withRouter
    }

    plugins.push(routerToUse)
  }

  if (customOptions?.withPinia) {
    let piniaToUse = pinia

    if (typeof customOptions?.withPinia !== 'boolean') {
      piniaToUse = customOptions.withPinia
    }

    plugins.push(piniaToUse)
  }

  return plugins
}
