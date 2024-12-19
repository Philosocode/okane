<script setup lang="ts">
// Internal
import DeleteAccountModal from '@features/auth/components/DeleteAccountModal.vue'
import EditName from '@features/auth/components/EditName.vue'
import EditPassword from '@features/auth/components/EditPassword.vue'
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/layouts/PageLayout.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import { useQueryPasswordRequirements } from '@features/auth/composables/useQueryPasswordRequirements'

const { data: requirements } = useQueryPasswordRequirements()
</script>

<template>
  <PageLayout v-if="requirements">
    <Heading tag="h1">{{ AUTH_COPY.ACCOUNT_PAGE.HEADING }}</Heading>
    <EditName />
    <EditPassword :requirements="requirements" />
    <hr class="divider" role="separator" />
    <DeleteAccountModal />
  </PageLayout>
</template>

<style scoped>
.divider {
  margin-block: var(--space-lg);
}
</style>
