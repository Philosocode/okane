<script setup lang="ts">
// External
import { useRouter } from 'vue-router'

// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/layouts/PageLayout.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { ROUTE_NAME } from '@shared/services/router/router'

import { type AuthFormState } from '@features/auth/types/authForm'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

const authStore = useAuthStore()
const router = useRouter()

async function handleSubmit(formState: AuthFormState) {
  try {
    await authStore.login(formState.email, formState.password)
    await router.push({ name: ROUTE_NAME.FINANCES })
  } catch (err) {
    console.error('Error logging in:', err)
  }
}
</script>

<template>
  <PageLayout>
    <Heading tag="h1">{{ AUTH_COPY.LOGIN }}</Heading>
    <AuthForm form-type="login" @submit="handleSubmit" />
  </PageLayout>
</template>
