<script setup lang="ts">
// External
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

// Internal
import FormInput from '@/features/forms/components/FormInput.vue'
import PageLayout from '@/shared/layouts/PageLayout.vue'

import { RouteName } from '@/features/navigation/router'

import { isValidPassword } from '@/features/auth/utils/authUtils'

import { APIClient } from '@/shared/services/APIClient'

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

async function handleSubmit() {
  if (!formIsValid.value) return

  try {
    const user = await APIClient.post('/auth/login', formState.value)
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
</style>
