<script setup lang="ts">
// Internal
import AppButton from '@shared/components/button/AppButton.vue'
import Card from '@shared/components/wrapper/Card.vue'

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
  <Card class="card">
    <form class="form" @submit.prevent="emit('submit')">
      <fieldset class="fieldset">
        <slot />

        <AppButton
          class="submit-button"
          :disabled="props.submitButtonIsDisabled"
          type="submit"
          variant="callToAction"
        >
          {{ submitButtonText }}
        </AppButton>

        <p v-if="props.submitError" class="submit-error">{{ props.submitError }}</p>
        <p v-else-if="props.submitSuccess" class="submit-success">{{ props.submitSuccess }}</p>

        <slot name="footer" />
      </fieldset>
    </form>
  </Card>
</template>

<style scoped lang="scss">
.fieldset {
  border: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-sm);

  @include respond(sm) {
    padding: var(--space-lg);
  }
}

.submit-button {
  margin-top: var(--space-sm);
}

.submit-error {
  color: var(--color-error);
}

.submit-success {
  color: var(--color-accent-dim);
}
</style>
