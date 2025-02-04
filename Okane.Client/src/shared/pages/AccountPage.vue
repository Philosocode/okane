<script setup lang="ts">
// Internal
import DeleteAccountModal from '@features/auth/components/DeleteAccountModal.vue'
import EditName from '@features/auth/components/EditName.vue'
import EditPassword from '@features/auth/components/EditPassword.vue'
import Heading from '@shared/components/Heading.vue'
import HorizontalDivider from '@shared/components/HorizontalDivider.vue'
import PageLayout from '@shared/components/wrappers/PageLayout.vue'

import { AUTH_COPY } from '@features/auth/constants/copy'

import { useQueryPasswordRequirements } from '@features/auth/composables/useQueryPasswordRequirements'

const { data: requirements } = useQueryPasswordRequirements()
</script>

<template>
  <PageLayout v-if="requirements">
    <Heading tag="h1">{{ AUTH_COPY.ACCOUNT_PAGE.HEADING }}</Heading>
    <div class="column flow">
      <section class="row">
        <EditPassword class="edit-password" :requirements="requirements" />
        <EditName class="edit-name" />
      </section>
      <HorizontalDivider />
      <DeleteAccountModal />
    </div>
  </PageLayout>
</template>

<style scoped lang="scss">
.column {
  --flow-space: var(--space-lg);
}

.edit-name {
  @include respond(sm) {
    align-self: start;
  }
}

.edit-password {
  @include respond(sm) {
  }
}

.row {
  display: grid;
  gap: var(--space-md);

  @include respond(sm) {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
