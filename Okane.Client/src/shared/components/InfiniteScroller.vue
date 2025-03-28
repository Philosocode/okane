<script setup lang="ts">
// External
import { computed } from 'vue'

import { type InfiniteData, type UseInfiniteQueryReturnType } from '@tanstack/vue-query'

// Internal
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import Loader from '@shared/components/loader/Loader.vue'
import Observer from '@shared/components/Observer.vue'

import { type ApiPaginatedResponse } from '@shared/services/apiClient/types'

type Props = {
  items: unknown[]
  queryResult: UseInfiniteQueryReturnType<InfiniteData<ApiPaginatedResponse, unknown>, Error>
}

const props = defineProps<Props>()
const showLoader = computed(
  () => props.queryResult.isLoading.value || props.queryResult.isFetchingNextPage.value,
)

function handleObserverChange(isIntersecting: boolean) {
  if (isIntersecting) props.queryResult.fetchNextPage()
}
</script>

<template>
  <div>
    <slot v-if="!props.queryResult.isLoading.value && props.items.length === 0" name="noItems" />

    <slot v-if="props.items.length > 0" name="default" />

    <slot v-if="props.queryResult.error.value" name="error">
      <ErrorMessage>{{ props.queryResult.error.value }}</ErrorMessage>
    </slot>

    <div v-if="props.queryResult.hasNextPage.value">
      <Observer :watch-dep="props.queryResult.data" @change="handleObserverChange" />
    </div>

    <slot
      v-if="props.items.length > 0 && !props.queryResult.hasNextPage.value"
      name="noMoreItems"
    />

    <div v-if="showLoader" class="loader">
      <Loader />
    </div>
  </div>
</template>

<style scoped>
.loader {
  display: flex;
  justify-content: center;
  margin-block: var(--space-lg);
}
</style>
