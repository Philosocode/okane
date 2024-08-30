<script setup lang="ts">
// External
import { RouterLink } from 'vue-router'

// Internal
import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { FINANCES_COPY } from '@features/financeRecords/constants/copy'
import { ROUTE_NAME } from '@shared/services/router/router'

const authStore = useAuthStore()
</script>

<template>
  <nav>
    <template v-if="authStore.isLoggedIn">
      <RouterLink :to="{ name: ROUTE_NAME.FINANCES }">{{ FINANCES_COPY.FINANCES }}</RouterLink>
      <RouterLink to="#" @click="authStore.logout">{{ AUTH_COPY.LOGOUT }}</RouterLink>
    </template>
    <template v-else>
      <RouterLink :to="{ name: ROUTE_NAME.LOGIN }">{{ AUTH_COPY.LOGIN }}</RouterLink>
      <RouterLink :to="{ name: ROUTE_NAME.REGISTER }">{{ AUTH_COPY.REGISTER }}</RouterLink>
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
