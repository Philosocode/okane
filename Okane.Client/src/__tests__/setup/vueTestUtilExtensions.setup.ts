// External
import { config, DOMWrapper, VueWrapper } from '@vue/test-utils'

function plugin(wrapper: VueWrapper) {
  return {
    findAllByText(selector: string, text: string) {
      return wrapper.findAll(selector).filter((node) => node.text().includes(text))
    },
    findByText(selector: string, text: string) {
      return wrapper.findAll(selector).find((node) => node.text().includes(text))
    },
  }
}

config.plugins.VueWrapper.install(plugin)

declare module '@vue/test-utils' {
  export interface VueWrapper {
    findAllByText<T extends Node>(element: string, text: string): DOMWrapper<T>[]
    findByText<T extends Node>(element: string, text: string): DOMWrapper<T>
  }
}
