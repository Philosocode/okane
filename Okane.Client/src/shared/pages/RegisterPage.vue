<script setup lang="ts">
// External
import { useRouter } from 'vue-router'

// Internal
import PageLayout from '@/shared/layouts/PageLayout.vue'

import type { AuthFormState } from '@/features/auth/auth.types'

import { useAuthStore } from '@/features/auth/useAuthStore'

import { omitObjectKeys } from '@/shared/utils/object.utils'
import AuthForm from '@/features/auth/AuthForm.vue'
import { RouteName } from '@/shared/services/router.service'

const authStore = useAuthStore()
const router = useRouter()

async function handleSubmit(formState: AuthFormState) {
  const postData = omitObjectKeys(formState, ['passwordConfirm'])

  try {
    await authStore.register(postData.email, postData.name, postData.password)
    await router.push({ name: RouteName.LoginPage })
  } catch (err) {
    console.error('Error registering:', err)
  }
}
</script>

<template>
  <PageLayout>
    <h1>Register</h1>
    <AuthForm form-type="register" @submit="handleSubmit" />
  </PageLayout>
</template>

<style scoped>
fieldset {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 12rem;
}
</style>
