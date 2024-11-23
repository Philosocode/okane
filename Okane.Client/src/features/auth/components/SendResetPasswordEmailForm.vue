<script setup lang="ts">
// External
import { ref } from 'vue'

// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'
import FormInput from '@shared/components/form/FormInput.vue'
import Heading from '@shared/components/Heading.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { INPUT_TYPE } from '@shared/constants/form'

import { useSendResetPasswordEmail } from '@features/auth/composables/useSendResetPasswordEmail'

const emit = defineEmits<{
  (e: 'success'): void
}>()

const sendMutation = useSendResetPasswordEmail()
const email = ref('')

function handleSubmit() {
  sendMutation.mutate(
    { email: email.value },
    {
      onSuccess() {
        emit('success')
      },
      onError(err) {
        console.error('Error sending reset password email:', err)
      },
    },
  )
}
</script>

<template>
  <Heading tag="h1">{{ AUTH_COPY.SEND_RESET_PASSWORD_EMAIL.RESET_PASSWORD }}</Heading>
  <p>{{ AUTH_COPY.SEND_RESET_PASSWORD_EMAIL.ENTER_YOUR_EMAIL }}</p>

  <AuthForm
    class="auth-form"
    :submit-button-text="AUTH_COPY.SEND_RESET_PASSWORD_EMAIL.RESET_PASSWORD"
    @submit="handleSubmit"
  >
    <div>
      <FormInput
        :label="AUTH_COPY.AUTH_FORM.EMAIL"
        name="email"
        :type="INPUT_TYPE.EMAIL"
        v-model="email"
      />

      <p v-if="sendMutation.isError.value" class="submit-error">
        {{ AUTH_COPY.SEND_RESET_PASSWORD_EMAIL.ERROR }}
      </p>
    </div>
  </AuthForm>
</template>

<style scoped>
.auth-form {
  margin-block: var(--space-md);
}

.submit-error {
  color: var(--color-error);
  margin-top: var(--space-xs);
}
</style>
