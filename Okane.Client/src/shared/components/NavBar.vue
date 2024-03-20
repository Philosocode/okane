<script setup lang="ts">
// External
import { RouterLink } from 'vue-router'

// Internal
import { RouteName } from '@/shared/services/router.service'

import { useAuthStore } from '@/features/auth/useAuthStore'

const authStore = useAuthStore()
</script>

<template>
  <nav>
    <template v-if="authStore.isLoggedIn">
      <RouterLink :to="{ name: RouteName.DashboardPage }">Dashboard</RouterLink>
      <RouterLink to="#" @click="authStore.logout">Log Out</RouterLink>
    </template>
    <template v-else>
      <RouterLink :to="{ name: RouteName.LoginPage }">Login</RouterLink>
      <RouterLink :to="{ name: RouteName.RegisterPage }">Register</RouterLink>
    </template>
  </nav>
</template>

<style scoped lang="scss">
nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
}

a {
  color: var(--color-green-200);

  &:hover {
    color: var(--color-green-400);
  }
}
</style>
