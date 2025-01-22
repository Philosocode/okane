<script setup lang="ts">
// External
import { RouterView } from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

// Internal
import NavBar from '@shared/components/NavBar.vue'
import Toaster from '@shared/components/toast/Toaster.vue'
</script>

<template>
  <header>
    <NavBar />
  </header>
  <RouterView />
  <Toaster />
  <VueQueryDevtools buttonPosition="bottom-left" />
</template>
