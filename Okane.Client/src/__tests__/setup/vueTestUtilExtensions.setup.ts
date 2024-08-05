// External
import { config, type DOMWrapper, type VueWrapper } from '@vue/test-utils'

// Internal
import type { HTMLElementTagName } from '@shared/types/html.types'

function plugin(wrapper: VueWrapper) {
  return {
    findAllByText(selector: HTMLElementTagName, text: string) {
      return wrapper.findAll(selector).filter((node) => node.text().includes(text))
    },
    findByText(selector: HTMLElementTagName, text: string) {
      return wrapper.findAll(selector).find((node) => node.text().includes(text))
    },
  }
}

config.plugins.VueWrapper.install(plugin)

declare module '@vue/test-utils' {
  export interface VueWrapper {
    findAllByText<K extends HTMLElementTagName>(
      element: K,
      text: string,
    ): DOMWrapper<HTMLElementTagNameMap[K]>[]

    findByText<K extends HTMLElementTagName>(
      element: K,
      text: string,
    ): DOMWrapper<HTMLElementTagNameMap[K]>
  }
}
