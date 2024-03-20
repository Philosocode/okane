<script setup lang="ts">
// External
import { useRouter } from 'vue-router'

// Internal
import AuthForm from '@/features/auth/AuthForm.vue'
import Heading from '@/shared/components/Heading.vue'
import PageLayout from '@/shared/layouts/PageLayout.vue'

import type { AuthFormState } from '@/features/auth/auth.types'

import { useAuthStore } from '@/features/auth/useAuthStore'
import { RouteName } from '@/shared/services/router.service'

const authStore = useAuthStore()
const router = useRouter()

async function handleSubmit(formState: AuthFormState) {
  try {
    await authStore.login(formState.email, formState.password)
    await router.push({ name: RouteName.DashboardPage })
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
