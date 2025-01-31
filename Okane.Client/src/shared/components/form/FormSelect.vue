<script setup lang="ts">
// Internal
import FormLabel from '@shared/components/form/FormLabel.vue'

import { VISUALLY_HIDDEN_CLASS } from '@shared/constants/styles'

import { getUniqueFormControlId } from '@shared/utils/form'

const model = defineModel<number | string>()

export type SelectOption = {
  value: number | string

  label?: string
}

export type FormSelectProps = {
  options: SelectOption[]
  label: string
  name: string

  withHiddenLabel?: boolean
}

const controlId = getUniqueFormControlId()
const props = defineProps<FormSelectProps>()
</script>

<template>
  <div class="root">
    <FormLabel :class="{ [VISUALLY_HIDDEN_CLASS]: withHiddenLabel }" :for="controlId">
      {{ props.label }}
    </FormLabel>
    <select
      class="form-input select"
      :id="controlId"
      :name="props.name"
      v-model="model"
      v-bind="$attrs"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :selected="option.value === model"
        :value="option.value"
      >
        {{ option.label ?? option.value }}
      </option>
    </select>
  </div>
</template>

<style scoped lang="scss">
.select {
  background-color: transparent;
  border: var(--border-main);
  color: var(--color-text);
  display: block;
}
</style>
