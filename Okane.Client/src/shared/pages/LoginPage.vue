<script setup lang="ts">
// External
import { useRouter } from 'vue-router'

// Internal
import AuthForm from '@/features/auth/AuthForm.vue'
import Heading from '@/shared/components/Heading.vue'
import PageLayout from '@/shared/layouts/PageLayout.vue'

import { ROUTE_NAME } from '@/shared/services/router/router.constants'

import type { AuthFormState } from '@/features/auth/auth.types'

import { useAuthStore } from '@/features/auth/useAuthStore'

const authStore = useAuthStore()
const router = useRouter()

async function handleSubmit(formState: AuthFormState) {
  try {
    await authStore.login(formState.email, formState.password)
    await router.push({ name: ROUTE_NAME.DASHBOARD })
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

<style scoped>
.page-heading {
  margin-bottom: var(--spacing-xs);
}
</style>
