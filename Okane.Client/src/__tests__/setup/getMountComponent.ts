// External
import merge from 'lodash.merge'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { mount, type ComponentMountingOptions } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { VUE_QUERY_CLIENT, type QueryClient } from '@tanstack/vue-query'

import type { Component, Plugin } from 'vue'
import type { Router } from 'vue-router'

// Internal
import { createAppRouter } from '@shared/services/router/router'

import '@shared/services/fontAwesome/fontAwesome'
import { testQueryClient } from '@tests/queryClient/testQueryClient'

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
  withQueryClient?: boolean | QueryClient
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
    // lodash.merge doesn't support symbols, so we need to manually merge the provide objects.
    const mergedProvide: Record<string | symbol, unknown> = baseOptions?.global?.provide ?? {}
    const perMountProvide: Record<string | symbol, unknown> = perMountOptions?.global?.provide ?? {}

    Object.getOwnPropertySymbols(perMountProvide).forEach((key) => {
      mergedProvide[key] = perMountProvide[key]
    })

    const mergedOptions = merge(
      {
        global: {
          plugins: [] as Plugin[],
          provide: mergedProvide,
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

  if (customOptions?.withQueryClient) {
    let queryClientToUse = testQueryClient

    if (typeof customOptions.withQueryClient !== 'boolean') {
      queryClientToUse = customOptions.withQueryClient
    }

    plugins.push({
      install(app) {
        app.provide(VUE_QUERY_CLIENT, queryClientToUse)
      },
    })
  }

  return plugins
}
