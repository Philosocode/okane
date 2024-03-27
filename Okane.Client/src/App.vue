<script setup lang="ts">
// External
import { RouterView } from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

// Internal
import NavBar from '@shared/components/NavBar.vue'
</script>

<template>
  <header>
    <NavBar />
  </header>
  <RouterView />
  <VueQueryDevtools />
</template>
