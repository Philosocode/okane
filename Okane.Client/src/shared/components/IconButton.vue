<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

export type IconButtonProps = {
  icon: string
  title: string
}

const props = defineProps<IconButtonProps>()
</script>

<template>
  <button class="button" v-bind="$attrs">
    <FontAwesomeIcon :icon="props.icon" :title="props.title" />
  </button>
</template>

<style scoped></style>
