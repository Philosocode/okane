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
  label: string

  withHiddenLabel?: boolean
}

const controlId = getUniqueFormControlId()
const props = defineProps<FormSelectProps>()
</script>

<template>
  <div class="root">
    <label :class="{ label: true, 'visually-hidden': withHiddenLabel }" :for="controlId">
      {{ props.label }}
    </label>
    <select class="select" :id="controlId" v-model="model" v-bind="$attrs">
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

.visually-hidden {
  @include visually-hidden;
}

.select {
  flex-grow: 1;
}
</style>
