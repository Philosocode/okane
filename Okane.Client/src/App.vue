<script setup lang="ts">
// External
import { computed, onMounted, ref } from 'vue';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

// Internal
import { APIClient } from '@/shared/services/APIClient';

const isHealthy = ref<boolean>()

type HealthCheckResponse = {
  status: 'Healthy' | 'Unhealthy'
  duration: number
}

onMounted(() => {
  APIClient.get<HealthCheckResponse>("/health")
    .then(res => {
      isHealthy.value = res.status === 'Healthy'
    })
    .catch(() => {
      isHealthy.value = false
    })
})

const healthMessage = computed(() => {
  if (isHealthy.value === true) return "Healthy"
  if (isHealthy.value === false) return "Unhealthy"
  return "Loading..."
})

</script>

<template>
  <header>
    <h1>Hello world</h1>
    <h2>Server Health: {{ healthMessage }}</h2>
  </header>
  <VueQueryDevtools />
</template>

<style scoped>
</style>
