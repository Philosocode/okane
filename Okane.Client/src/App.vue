<script setup lang="ts">
// External
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

// Internal
import NavBar from '@/features/navigation/components/NavBar.vue'

import type { User } from '@/features/users/types/userTypes'

import { useAuthStore } from '@/features/auth/stores/useAuthStore'

import { ApiClient } from '@/shared/services/ApiClient'

const authStore = useAuthStore()

onMounted(async () => {
  try {
    const user = await ApiClient.get<User>('/auth/self')
    authStore.setAuthUser(user)
  } catch (err) {
    console.error('Failed to fetch self:', err)
  }
})
</script>

<template>
  <header>
    <NavBar />
  </header>
  <RouterView />
  <VueQueryDevtools />
</template>

<style></style>
