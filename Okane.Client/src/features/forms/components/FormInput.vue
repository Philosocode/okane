<script setup lang="ts">
// External
import { type InputTypeHTMLAttribute } from 'vue'

// Internal
import { getUniqueFormId } from '@/features/forms/utils/formUtils'

type Props = {
  label: string
  name: string
  type: InputTypeHTMLAttribute

  error?: string
}

const controlId = getUniqueFormId()
const model = defineModel<number | string>();
const props = defineProps<Props>()
</script>

<template>
  <div>
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
    <p aria-live="assertive" class="error" :id="`${controlId}-error`" v-if="error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
