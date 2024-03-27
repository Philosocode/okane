<script setup lang="ts">
// External
import { useRouter } from 'vue-router'

// Internal
import AuthForm from '@features/auth/AuthForm.vue'
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/layouts/PageLayout.vue'

import type { AuthFormState } from '@features/auth/auth.types'

import { useAuthStore } from '@features/auth/useAuthStore'

import { omitObjectKeys } from '@shared/utils/object.utils'
import { ROUTE_NAME } from '@shared/services/router/router.service'

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

<style scoped></style>
