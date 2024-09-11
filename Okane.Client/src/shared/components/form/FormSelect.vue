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
  <div class="root">
    <label class="label" :for="controlId" v-if="props.label">{{ props.label }}</label>
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
.root {
  display: flex;
  flex-direction: column;
}

.label {
  display: block;
}

select {
  flex-grow: 1;
  margin-top: var(--space-2xs);
}
</style>
