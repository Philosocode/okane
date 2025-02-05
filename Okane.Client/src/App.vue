<script setup lang="ts">
// External
import { RouterView } from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

// Internal
import Footer from '@shared/components/nav/Footer.vue'
import NavBar from '@shared/components/nav/NavBar.vue'
import Toaster from '@shared/components/toast/Toaster.vue'
</script>

<template>
  <div class="site-content">
    <header>
      <NavBar />
    </header>
    <RouterView />
    <Footer />
  </div>
  <Toaster />
  <VueQueryDevtools buttonPosition="bottom-left" />
</template>

<style scoped>
.site-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
</style>
