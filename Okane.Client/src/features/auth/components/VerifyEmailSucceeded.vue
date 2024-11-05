<script setup lang="ts">
// External
import { RouterLink } from 'vue-router'

// Internal
import { appRoutes } from '@shared/services/router/router'
import { AUTH_COPY } from '@features/auth/constants/copy'
</script>

<template>
  <p class="body-text">
    {{ AUTH_COPY.VERIFY_EMAIL.VERIFICATION_SUCCEEDED.SUCCEEDED }}
    <RouterLink class="login-link" :to="appRoutes.login.buildPath()">{{
      AUTH_COPY.VERIFY_EMAIL.VERIFICATION_SUCCEEDED.CLICK_HERE_TO_LOGIN
    }}</RouterLink>
  </p>
</template>
