<script setup lang="ts">
// External
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Internal
import Button from '@shared/components/Button.vue'

export type IconButtonProps = {
  icon: string
  title: string
}

const props = defineProps<IconButtonProps>()
</script>

<template>
  <Button class="button" v-bind="$attrs">
    <FontAwesomeIcon :icon="props.icon" :title="props.title" />
  </Button>
</template>

<style scoped></style>
