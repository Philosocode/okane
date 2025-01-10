// External
import { type Mock } from 'vitest'
import { type VueWrapper } from '@vue/test-utils'

// Internal
import TagCombobox, { type TagComboboxProps } from '@shared/components/form/TagCombobox.vue'

import { HTML_ROLE } from '@shared/constants/html'
import { SHARED_COPY } from '@shared/constants/copy'
import { TAG_COMBOBOX_DISABLED_CLASS, TAG_COMBOBOX_SPINNER_CLASS } from '@shared/constants/tags'

import { type Tag } from '@shared/types/tag'

import { createTestTag } from '@tests/factories/tag'

const mountComponent = getMountComponent(TagCombobox, {
  global: {
    stubs: {
      teleport: true,
    },
  },
  withQueryClient: true,
})

const defaultProps: TagComboboxProps = {
  allTags: [
    createTestTag({ id: 1, name: '1' }),
    createTestTag({ id: 2, name: '2' }),
    createTestTag({ id: 3, name: '3' }),
  ],
  id: 'cool-combobox',
  selectedTags: [],
}

const elements = {
  combobox(wrapper: VueWrapper) {
    return wrapper.find(`input[role="${HTML_ROLE.COMBOBOX}"]`)
  },
  tagOption(wrapper: VueWrapper, tagName: string) {
    return wrapper.find(`li[aria-label="${tagName}"]`)
  },
}

test('renders a label', () => {
  const wrapper = mountComponent({ props: defaultProps })
  const label = wrapper.findByText('label', SHARED_COPY.TAG_COMBOBOX.LABEL)
  expect(label.attributes('for')).toBe(defaultProps.id)
})

test('renders a combobox with an ID', () => {
  const wrapper = mountComponent({ props: defaultProps })
  const combobox = elements.combobox(wrapper)
  expect(combobox.attributes('id')).toBe(defaultProps.id)
})

test('renders a placeholder', () => {
  const wrapper = mountComponent({ props: defaultProps })
  const placeholder = wrapper.findByText('div', SHARED_COPY.TAG_COMBOBOX.PLACEHOLDER)
  expect(placeholder).toBeDefined()
})

test('renders the no options text when allTags is empty', () => {
  const wrapper = mountComponent({
    props: {
      ...defaultProps,
      allTags: [],
    },
  })
  const text = wrapper.findByText('div', SHARED_COPY.TAG_COMBOBOX.NO_OPTIONS)
  expect(text).toBeDefined()
})

test('renders the no results text when no tags match the search query', async () => {
  const wrapper = mountComponent({ props: defaultProps })
  const combobox = elements.combobox(wrapper)
  await combobox.setValue('??????')

  const text = wrapper.findByText('div', SHARED_COPY.TAG_COMBOBOX.NO_RESULTS)
  expect(text).toBeDefined()
})

test('renders non-selected tag options', () => {
  const wrapper = mountComponent({
    props: {
      ...defaultProps,
      selectedTags: [defaultProps.allTags[0]],
    },
  })

  expect(elements.tagOption(wrapper, defaultProps.allTags[0].name).exists()).toBe(false)

  defaultProps.selectedTags.slice(1).forEach((tag) => {
    const tagElement = elements.tagOption(wrapper, tag.name)
    expect(tagElement.exists()).toBe(true)
  })
})

test('does not disable the component when disabled is false', () => {
  const wrapper = mountComponent({ props: defaultProps })
  expect(wrapper.find(`div.${TAG_COMBOBOX_DISABLED_CLASS}`).exists()).toBe(false)
})

test('does not render a spinner', () => {
  const wrapper = mountComponent({ props: defaultProps })
  expect(wrapper.find(`span.${TAG_COMBOBOX_SPINNER_CLASS}`).exists()).toBe(false)
})

test('emits a "change" event when selecting a tag', async () => {
  const wrapper = mountComponent({ props: defaultProps })
  const tag = defaultProps.allTags[0]
  const option = elements.tagOption(wrapper, tag.name)

  expect(wrapper.emitted('change')).toBeUndefined()
  await option.trigger('click')
  const emitted = wrapper.emitted('change') as Tag[][][]
  expect(emitted.flat(Infinity)).toEqual([tag])
})

test('disables the component when disabled is true', () => {
  const wrapper = mountComponent({
    props: {
      ...defaultProps,
      disabled: true,
    },
  })
  expect(wrapper.find(`div.${TAG_COMBOBOX_DISABLED_CLASS}`).exists()).toBe(true)
})

test('renders a spinner when loading is true', () => {
  const wrapper = mountComponent({
    props: {
      ...defaultProps,
      loading: true,
    },
  })
  expect(wrapper.find(`span.${TAG_COMBOBOX_SPINNER_CLASS}`).exists()).toBe(true)
})

describe('when onCreate is provided', () => {
  let onCreateMock: Mock

  // This layer of indirection is here because I was getting an error when passing onCreateMock
  // directly as a prop: [Vue warn]: Avoid app logic that relies on enumerating keys on a component
  // instance. The keys will be empty in production mode to avoid performance overhead.
  function onCreate(tag: Tag) {
    onCreateMock(tag)
    return false
  }

  beforeEach(() => {
    onCreateMock = vi.fn()
  })

  test("calls onCreate when the selected tag doesn't exist", async () => {
    const wrapper = mountComponent({
      props: {
        ...defaultProps,
        onCreate,
      },
    })

    const combobox = elements.combobox(wrapper)
    const newTagName = 'coolest-tag-123'
    await combobox.setValue(newTagName)

    const option = elements.tagOption(wrapper, newTagName)
    await option.trigger('click')

    expect(onCreateMock).toHaveBeenCalledWith({ id: newTagName, name: newTagName })
  })

  test('does not call onCreate when the selected tag exists', async () => {
    const wrapper = mountComponent({
      props: {
        ...defaultProps,
        onCreate,
      },
    })

    const option = elements.tagOption(wrapper, defaultProps.allTags[0].name)
    await option.trigger('click')
    expect(onCreateMock).not.toHaveBeenCalledWith()
  })
})
