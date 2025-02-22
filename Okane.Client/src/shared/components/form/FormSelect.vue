<script setup lang="ts">
// Internal
import FormLabel from '@shared/components/form/FormLabel.vue'

import { VISUALLY_HIDDEN_CLASS } from '@shared/constants/styles'

import { getUniqueFormControlId } from '@shared/utils/form'

export type SelectOption = {
  value: string

  label?: string
}

export type FormSelectProps = {
  options: SelectOption[]
  label: string
  name: string

  withHiddenLabel?: boolean
  withShadow?: boolean
}

const props = defineProps<FormSelectProps>()

const controlId = getUniqueFormControlId()
const model = defineModel()
</script>

<template>
  <div>
    <FormLabel :class="{ [VISUALLY_HIDDEN_CLASS]: withHiddenLabel }" :for="controlId">
      {{ props.label }}
    </FormLabel>

    <div
      class="select-wrapper"
      :class="{ 'after-shadow': props.withShadow, 'with-shadow': props.withShadow }"
    >
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
  </div>
</template>

<style scoped lang="scss">
.select-wrapper {
  position: relative;
  width: max-content;
}

.with-shadow::after {
  transform: translate(5px, 5px);
}

.select {
  background-color: var(--color-site-bg);
  border: var(--border-main);
  color: var(--color-text);
  display: block;
  position: relative;
  transition: background-color 200ms ease-in-out;

  &:hover,
  &:active,
  &:focus {
    background-color: var(--color-main-gray-deep);
  }
}
</style>
