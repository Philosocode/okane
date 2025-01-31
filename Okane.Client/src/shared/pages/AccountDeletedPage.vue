<script setup lang="ts">
// Internal
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/components/wrappers/PageLayout.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'
</script>

<template>
  <PageLayout is-narrow>
    <Heading tag="h1">{{ AUTH_COPY.ACCOUNT_DELETED.HEADING }}</Heading>
    <p>{{ AUTH_COPY.ACCOUNT_DELETED.TEXT }}</p>
  </PageLayout>
</template>
