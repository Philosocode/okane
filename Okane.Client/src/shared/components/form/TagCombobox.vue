<script setup lang="ts">
// External
import Multiselect from '@vueform/multiselect'

// Internal
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
    <label class="label" :for="props.id">{{ SHARED_COPY.TAG_COMBOBOX.LABEL }}</label>
    <Multiselect
      :append-new-option="false"
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

<style scoped>
.label {
  display: inline-block;
  margin-bottom: var(--space-2xs);
}
</style>
