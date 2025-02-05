<script setup lang="ts">
// Internal
import Heading from '@shared/components/nav/Heading.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
</script>

<template>
  <Heading tag="h1">{{ AUTH_COPY.SUCCESSFULLY_REGISTERED.HEADING }}</Heading>
  <p>{{ AUTH_COPY.SUCCESSFULLY_REGISTERED.BODY }}</p>
</template>
