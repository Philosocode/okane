<script setup lang="ts">
// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'
import Heading from '@shared/components/Heading.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import type { AuthFormState } from '@features/auth/types/authForm'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { omitObjectKeys } from '@shared/utils/object'

const emit = defineEmits<{
  (e: 'succeeded'): void
}>()

const authStore = useAuthStore()

async function handleSubmit(formState: AuthFormState) {
  const postData = omitObjectKeys(formState, ['passwordConfirm'])

  try {
    await authStore.register(postData.email, postData.name, postData.password)
    emit('succeeded')
  } catch (err) {
    console.error('Error registering:', err)
  }
}
</script>

<template>
  <Heading tag="h1">{{ AUTH_COPY.REGISTER }}</Heading>
  <AuthForm form-type="register" @submit="handleSubmit" />
</template>
