<script setup lang="ts">
// External
import { RouterLink } from 'vue-router'

// Internal
import { useAuthStore } from '@features/auth/composables/useAuthStore'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { ROUTE_NAME } from '@shared/services/router/router'

const authStore = useAuthStore()
</script>

<template>
  <nav class="nav">
    <template v-if="authStore.isLoggedIn">
      <RouterLink to="#" @click="authStore.logout">{{ AUTH_COPY.LOGOUT }}</RouterLink>
    </template>
    <template v-else>
      <RouterLink :to="{ name: ROUTE_NAME.LOGIN }">{{ AUTH_COPY.AUTH_FORM.LOGIN }}</RouterLink>
      <RouterLink :to="{ name: ROUTE_NAME.REGISTER }">{{
        AUTH_COPY.AUTH_FORM.REGISTER
      }}</RouterLink>
    </template>
  </nav>
</template>

<style scoped lang="scss">
.nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
}
</style>
