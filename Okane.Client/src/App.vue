<script setup lang="ts">
// External
import { RouterView} from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

// Internal
import NavBar from '@/features/navigation/NavBar.vue'
</script>

<template>
  <header>
    <NavBar />
  </header>
  <RouterView />
  <VueQueryDevtools />
</template>

<style>
</style>
