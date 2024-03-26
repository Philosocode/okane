<script setup lang="ts">
// External
import { RouterLink } from 'vue-router'

// Internal

import { useAuthStore } from '@/features/auth/useAuthStore'
import { ROUTE_NAME } from '@/shared/services/router/router.service'

const authStore = useAuthStore()
</script>

<template>
  <nav>
    <template v-if="authStore.isLoggedIn">
      <RouterLink :to="{ name: ROUTE_NAME.DASHBOARD }">Dashboard</RouterLink>
      <RouterLink to="#" @click="authStore.logout">Logout</RouterLink>
    </template>
    <template v-else>
      <RouterLink :to="{ name: ROUTE_NAME.LOGIN }">Login</RouterLink>
      <RouterLink :to="{ name: ROUTE_NAME.REGISTER }">Register</RouterLink>
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
