<script setup lang="ts">
// Internal
import Button from '@shared/components/Button.vue'
import Card from '@shared/components/wrappers/Card.vue'
import CardHeading from '@shared/components/typography/CardHeading.vue'

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
  <Card>
    <form class="form" @submit.prevent="emit('submit')">
      <fieldset class="fieldset">
        <slot />

        <Button
          class="submit-button"
          :disabled="props.submitButtonIsDisabled"
          type="submit"
          variant="callToAction"
        >
          {{ submitButtonText }}
        </Button>

        <p v-if="props.submitError" class="submit-error">{{ props.submitError }}</p>
        <p v-else-if="props.submitSuccess" class="submit-success">{{ props.submitSuccess }}</p>
      </fieldset>
    </form>
  </Card>
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
}

.submit-error {
  color: var(--color-error);
}

.submit-success {
  color: var(--color-success);
}
</style>
