<script setup lang="ts">
// External
import { RouterLink } from 'vue-router'

// Internal
import LoginForm from '@features/auth/components/LoginForm.vue'
import PageLayout from '@shared/layouts/PageLayout.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
import { ROUTE_NAME } from '@shared/services/router/router'
</script>

<template>
  <PageLayout>
    <LoginForm />
    <RouterLink class="forgot-password" :to="{ name: ROUTE_NAME.SEND_RESET_PASSWORD_EMAIL }">{{
      AUTH_COPY.FORGOT_PASSWORD
    }}</RouterLink>
  </PageLayout>
</template>

<style scoped>
.forgot-password {
  display: inline-block;
  margin-top: var(--space-md);
}
</style>
