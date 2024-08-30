<script setup lang="ts">
// External
import { useRouter } from 'vue-router'

// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/layouts/PageLayout.vue'

import { ROUTE_NAME } from '@shared/services/router/router'

import { useAuthStore } from '@features/auth/composables/useAuthStore'
import type { AuthFormState } from '@features/auth/types/authForm'

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
    <Heading tag="h1">Login</Heading>
    <AuthForm form-type="login" @submit="handleSubmit" />
  </PageLayout>
</template>
