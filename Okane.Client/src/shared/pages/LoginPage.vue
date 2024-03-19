<script setup lang="ts">
// External
import { useRouter } from 'vue-router'

// Internal
import AuthForm from '@/features/auth/AuthForm.vue'
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
    <h1>Login</h1>
    <AuthForm form-type="login" @submit="handleSubmit" />
  </PageLayout>
</template>
