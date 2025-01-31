<script setup lang="ts">
// External
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// External
import Kicker from '@shared/components/typography/Kicker.vue'
import Link, { type LinkProps } from '@shared/components/Link.vue'

export type NavLinkProps = {
  icon: string
  text: string
  to: LinkProps['to']

  activeClass?: string
}

const props = defineProps<NavLinkProps>()

const linkAttributes = computed(() => ({
  class: 'link',
  to: props.to,
  ...(props.activeClass != null && { 'active-class': props.activeClass }),
}))
</script>

<template>
  <Link v-bind="linkAttributes">
    <FontAwesomeIcon class="icon" :icon="props.icon" title="" />
    <Kicker>{{ props.text }}</Kicker>
  </Link>
</template>

<style scoped lang="scss">
.link {
  color: var(--color-text);
  font-size: var(--font-size-xs);
  text-align: center;

  @include respond(sm) {
    font-size: var(--font-size-sm);
  }
}

.icon {
  font-size: var(--font-size-lg);
}
</style>
