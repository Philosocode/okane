<script setup lang="ts">
// Internal
import Heading from '@shared/components/Heading.vue'
import PageLayout from '@shared/layouts/PageLayout.vue'
import SaveFinanceRecordForm from '@features/financeRecords/components/SaveFinanceRecordForm.vue'
</script>

<template>
  <PageLayout>
    <Heading tag="h1">Dashboard</Heading>
    <p>You are logged in!</p>
    <SaveFinanceRecordForm />
  </PageLayout>
</template>
