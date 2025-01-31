<script setup lang="ts">
// External
import Multiselect from '@vueform/multiselect'

// Internal
import FormLabel from '@shared/components/form/FormLabel.vue'

import { SHARED_COPY } from '@shared/constants/copy'

import { type Tag } from '@shared/types/tag'

export type TagComboboxProps = {
  allTags: Tag[]
  id: string
  selectedTags: Tag[]

  disabled?: boolean
  loading?: boolean
  onCreate?: (tagToCreate: Tag) => false | Tag
}

const props = defineProps<TagComboboxProps>()

const emit = defineEmits<{
  (e: 'change', tags: Tag[]): void
}>()
</script>

<template>
  <div>
    <FormLabel :for="props.id">{{ SHARED_COPY.TAG_COMBOBOX.LABEL }}</FormLabel>
    <Multiselect
      :append-new-option="false"
      class="multiselect"
      :create-option="!!props.onCreate"
      :disabled="props.disabled"
      :id="props.id"
      mode="tags"
      label="name"
      :loading="props.loading"
      :no-options-text="SHARED_COPY.TAG_COMBOBOX.NO_OPTIONS"
      :no-results-text="SHARED_COPY.TAG_COMBOBOX.NO_RESULTS"
      :object="true"
      :on-create="props.onCreate"
      open-direction="top"
      :options="props.allTags"
      :placeholder="SHARED_COPY.TAG_COMBOBOX.PLACEHOLDER"
      searchable
      :value="props.selectedTags"
      value-prop="id"
      @change="(updatedTags) => emit('change', updatedTags)"
    />
  </div>
</template>

<style scoped lang="scss">
.multiselect {
  --ms-bg: var(--color-site-bg);
  --ms-border-color: var(--color-border);
  --ms-border-width: var(--border-width);
  --ms-caret-color: var(--color-text);
  --ms-clear-color: var(--color-text);
  --ms-clear-color-hover: var(--color-text);
  --ms-dropdown-bg: var(--color-site-bg);
  --ms-dropdown-border-color: var(--border-main-color);
  --ms-empty-color: var(--color-text);
  --ms-option-bg-pointed: var(--color-main-gray-deep);
  --ms-option-color-pointed: var(--color-text);
  --ms-placeholder-color: var(--color-text);
  --ms-radius: 0;
  --ms-ring-color: var(--color-focus-outline);
  --ms-ring-width: 0;
  --ms-spinner-color: var(--color-accent);
  --ms-tag-bg: var(--color-accent);
  --ms-tag-color: var(--color-text);
  --ms-tag-font-size: var(--font-size-md);
  --ms-tag-font-weight: 600;
  --ms-tag-radius: 0;
  --ms-tag-remove-radius: 0;
}
</style>

<style lang="scss">
// Controls the background and text colour of the inner part of the combobox.
.multiselect .multiselect-tags-search {
  background-color: var(--color-main-gray-deep) !important;
  color: var(--color-text) !important;
}
</style>
