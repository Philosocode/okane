<script setup lang="ts">
// External
import type { InputHTMLAttributes } from 'vue'

// Internal
import { ARIA_LIVE } from '@shared/constants/aria'

import { getUniqueFormControlId } from '@shared/utils/form'

export interface FormInputProps extends /* @vue-ignore */ InputHTMLAttributes {
  label: string
  name: string

  type?: InputHTMLAttributes['type']
  error?: string
}

const controlId = getUniqueFormControlId()
const model = defineModel<number | string>()
const props = defineProps<FormInputProps>()

const errorLabelId = `${controlId}-error`
</script>

<template>
  <div>
    <label :for="controlId">{{ label }}</label>
    <input
      v-bind="$attrs"
      v-model="model"
      :aria-describedby="props.error ? errorLabelId : undefined"
      :aria-invalid="props.error ? true : undefined"
      :id="controlId"
      :name="props.name"
      :type="props.type"
    />
    <p :aria-live="ARIA_LIVE.ASSERTIVE" class="error" :id="errorLabelId" v-if="error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
input {
  display: block;
  margin-top: var(--space-2xs);
  width: 100%;
}

.error {
  color: var(--color-error);
  margin-top: 0.5rem;
}
</style>
