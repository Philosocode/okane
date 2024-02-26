<script setup lang="ts">
// External
import { type InputTypeHTMLAttribute } from 'vue'

// Internal
import { getUniqueFormId } from '@/features/forms/utils/getUniqueFormId'

type Props = {
  label: string
  name: string
  type?: InputTypeHTMLAttribute
  error?: string
}

const controlId = getUniqueFormId()
const model = defineModel<number | string>();
const props = defineProps<Props>()
</script>

<template>
  <label :for="controlId">{{ label }}</label>
  <input
    v-bind="$attrs"
    v-model="model"
    :aria-describedby="props.error ? `${controlId}-error` : undefined"
    :aria-invalid="props.error ? true : undefined"
    :id="controlId"
    :name="props.name"
    :type="props.type"
  >
  <p
    aria-live="assertive"
    :id="`${controlId}-error`"
    v-if="error"
  >
    {{ error }}
  </p>
</template>
