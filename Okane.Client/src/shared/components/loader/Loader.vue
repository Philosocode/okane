<!-- FROM: https://github.com/n3r4zzurr0/svg-spinners?tab=readme-ov-file -->
<script setup lang="ts">
type Props = {
  title?: string
}

const props = withDefaults(defineProps<Props>(), { title: 'Loading...' })
</script>

<template>
  <svg
    class="root"
    role="img"
    focusable="false"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>{{ props.title }}</title>

    <g aria-hidden="true" class="spinner">
      <circle cx="12" cy="12" r="9.5" fill="none" stroke-width="3"></circle>
    </g>
  </svg>
</template>

<style scoped>
.root {
  stroke: var(--color-loader);
  width: 3rem;
  height: 3rem;
}

.spinner {
  transform-origin: center;
  animation: spinner_animation 2s linear infinite;
}

.spinner circle {
  stroke-linecap: round;
  animation: circle_animation 1.5s ease-in-out infinite;
}

@keyframes spinner_animation {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes circle_animation {
  0% {
    stroke-dasharray: 0 150;
    stroke-dashoffset: 0;
  }
  47.5% {
    stroke-dasharray: 42 150;
    stroke-dashoffset: -16;
  }
  95%,
  100% {
    stroke-dasharray: 42 150;
    stroke-dashoffset: -59;
  }
}
</style>
