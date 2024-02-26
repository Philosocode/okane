<script setup lang="ts">
// External
import { RouterLink } from 'vue-router'

// Internal
import { RouteName } from '@/features/navigation/router'
</script>

<template>
  <nav>
    <RouterLink :to="{ name: RouteName.DashboardPage }">Dashboard</RouterLink>
    <RouterLink :to="{ name: RouteName.LoginPage }">Login</RouterLink>
    <RouterLink :to="{ name: RouteName.RegisterPage }">Register</RouterLink>
  </nav>
</template>

<style scoped>
nav {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>