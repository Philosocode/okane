<script setup lang="ts">
// External
import { useRouter } from 'vue-router'

// Internal
import AuthForm from '@features/auth/components/AuthForm.vue'
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/layouts/PageLayout.vue'

import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { omitObjectKeys } from '@shared/utils/object'
import { ROUTE_NAME } from '@shared/services/router/router'
import type { AuthFormState } from '@features/auth/types/authForm'

const authStore = useAuthStore()
const router = useRouter()

async function handleSubmit(formState: AuthFormState) {
  const postData = omitObjectKeys(formState, ['passwordConfirm'])

  try {
    await authStore.register(postData.email, postData.name, postData.password)
    await router.push({ name: ROUTE_NAME.LOGIN })
  } catch (err) {
    console.error('Error registering:', err)
  }
}
</script>

<template>
  <PageLayout>
    <Heading tag="h1">Register</Heading>
    <AuthForm form-type="register" @submit="handleSubmit" />
  </PageLayout>
</template>
