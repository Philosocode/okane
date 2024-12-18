<script setup lang="ts">
export type AuthFormProps = {
  submitButtonText: string

  submitButtonIsDisabled?: boolean
  submitError?: string
  submitSuccess?: string
}

const props = defineProps<AuthFormProps>()

const emit = defineEmits<{
  (e: 'submit'): void
}>()
</script>

<template>
  <form class="form" @submit.prevent="emit('submit')">
    <fieldset class="fieldset">
      <slot />

      <button class="submit-button" :disabled="props.submitButtonIsDisabled" type="submit">
        {{ submitButtonText }}
      </button>

      <p v-if="props.submitError" class="submit-error">{{ props.submitError }}</p>
      <p v-else-if="props.submitSuccess" class="submit-success">{{ props.submitSuccess }}</p>
    </fieldset>
  </form>
</template>

<style scoped lang="scss">
.fieldset {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
}

.form {
  max-width: 22rem;
}

.submit-button {
  margin-top: var(--space-sm);

  &:disabled {
    color: var(--color-gray-300);
  }
}

.submit-error {
  color: var(--color-error);
}

.submit-success {
  color: var(--color-green-400);
}
</style>
