<script setup lang="ts">
// External
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

// Internal
import FormInput from '@/features/forms/components/FormInput.vue'
import PageLayout from '@/shared/layouts/PageLayout.vue'

import { RouteName } from '@/features/navigation/services/router'

import { useAuthStore } from '@/features/auth/stores/useAuthStore'

import { isValidPassword } from '@/features/auth/utils/authUtils'

const router = useRouter()

const formState = ref({
  email: '',
  password: '',
})

const formIsValid = computed<boolean>(() => {
  const { email, password } = formState.value
  const validations = [Boolean(email), Boolean(password), isValidPassword(password)[0]]

  return !validations.includes(false)
})

const authStore = useAuthStore()

async function handleSubmit() {
  if (!formIsValid.value) return

  try {
    await authStore.login(formState.value.email, formState.value.password)
    await router.push({ name: RouteName.DashboardPage })
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <PageLayout>
    <h1>Login</h1>

    <form @submit.prevent="handleSubmit">
      <fieldset>
        <FormInput label="Email" name="email" type="email" v-model="formState.email" />
        <FormInput label="Password" name="password" type="password" v-model="formState.password" />

        <button :disabled="!formIsValid" type="submit">Login</button>
      </fieldset>
    </form>
  </PageLayout>
</template>

<style scoped>
fieldset {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 12rem;
}
</style>@/shared/services/router@/features/auth/utils/auth
@/features/auth/utils/auth.utils@/features/auth/stores/auth.store@/features/auth/useAuthStore
@/features/navigation/services/router.service
