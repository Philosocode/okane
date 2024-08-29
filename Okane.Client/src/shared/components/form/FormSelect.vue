<script setup lang="ts">
// Internal
import { getUniqueFormControlId } from '@shared/utils/form'

const model = defineModel<number | string>()

export type SelectOption = {
  value: number | string

  label?: string
}

export type FormSelectProps = {
  options: SelectOption[]
  label?: string
}

const controlId = getUniqueFormControlId()
const props = defineProps<FormSelectProps>()
</script>

<template>
  <div>
    <label :for="controlId" v-if="props.label">{{ props.label }}</label>
    <select :id="controlId" v-model="model" v-bind="$attrs">
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
label {
  display: block;
}
</style>
