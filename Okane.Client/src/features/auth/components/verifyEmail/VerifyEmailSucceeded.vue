<script setup lang="ts">
// Internal
import Link from '@shared/components/Link.vue'

import { appRoutes } from '@shared/services/router/router'
import { AUTH_COPY } from '@features/auth/constants/copy'
</script>

<template>
  <p>
    {{ AUTH_COPY.VERIFY_EMAIL.VERIFICATION_SUCCEEDED.SUCCEEDED }}
    <Link :to="appRoutes.login.buildPath()">{{
      AUTH_COPY.VERIFY_EMAIL.VERIFICATION_SUCCEEDED.CLICK_HERE_TO_LOGIN
    }}</Link>
  </p>
</template>
