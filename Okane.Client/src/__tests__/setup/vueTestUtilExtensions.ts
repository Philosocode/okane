// External
import { config, type DOMWrapper, type VueWrapper } from '@vue/test-utils'

// Internal
import type { HTMLElementTagName } from '@shared/types/html'

type FindByTextOptions = {
  isCaseInsensitive?: boolean
  isExact?: boolean
}

function nodeMatchesText(
  node: DOMWrapper<Element>,
  text: string,
  options?: FindByTextOptions,
): boolean {
  let nodeText = node.text()

  if (options?.isCaseInsensitive) {
    nodeText = nodeText.toLowerCase()
    text = text.toLowerCase()
  }

  if (options?.isExact) return nodeText === text
  return nodeText.includes(text)
}

function plugin(wrapper: VueWrapper) {
  return {
    findAllByText(selector: HTMLElementTagName, text: string, options?: FindByTextOptions) {
      return wrapper.findAll(selector).filter((node) => nodeMatchesText(node, text, options))
    },
    findByText(selector: HTMLElementTagName, text: string, options?: FindByTextOptions) {
      return wrapper.findAll(selector).find((node) => nodeMatchesText(node, text, options))
    },
  }
}

config.plugins.VueWrapper.install(plugin)

declare module '@vue/test-utils' {
  export interface VueWrapper {
    findAllByText<K extends HTMLElementTagName>(
      element: K,
      text: string,
      options?: FindByTextOptions,
    ): DOMWrapper<HTMLElementTagNameMap[K]>[]

    findByText<K extends HTMLElementTagName>(
      element: K,
      text: string,
      options?: FindByTextOptions,
    ): DOMWrapper<HTMLElementTagNameMap[K]>
  }
}
