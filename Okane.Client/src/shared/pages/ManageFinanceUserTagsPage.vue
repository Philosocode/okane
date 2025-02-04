<script setup lang="ts">
// External
import { provide } from 'vue'

// Internal
import DeleteFinanceUserTagModal from '@features/financeUserTags/components/DeleteFinanceUserTagModal.vue'
import ErrorMessage from '@shared/components/typography/ErrorMessage.vue'
import FinanceUserTagGrid from '@features/financeUserTags/components/FinanceUserTagGrid.vue'
import Heading from '@shared/components/Heading.vue'
import Loader from '@shared/components/loader/Loader.vue'
import PageLayout from '@shared/components/wrappers/PageLayout.vue'
import RenameFinanceUserTagModal from '@features/financeUserTags/components/RenameFinanceUserTagModal.vue'
import TagTypeSelect from '@features/financeUserTags/components/TagTypeSelect.vue'

import { FINANCE_USER_TAGS_COPY } from '@features/financeUserTags/constants/copy'

import { useQueryFinanceUserTags } from '@features/financeUserTags/composables/useQueryFinanceUserTags'

import {
  MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL,
  useManageFinanceUserTagsProvider,
} from '@features/financeUserTags/providers/manageFinanceUserTagsProvider'

provide(MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL, useManageFinanceUserTagsProvider())

const {
  data: userTagMap,
  isError: errorFetchingUserTags,
  isLoading: isFetchingUserTags,
} = useQueryFinanceUserTags()
</script>

<template>
  <PageLayout>
    <Heading tag="h1">{{ FINANCE_USER_TAGS_COPY.MANAGE_PAGE.HEADING }}</Heading>

    <Loader v-if="isFetchingUserTags" />

    <template v-if="userTagMap">
      <section>
        <div class="tag-select">
          <TagTypeSelect />
        </div>

        <FinanceUserTagGrid :user-tag-map="userTagMap" />
      </section>
      <DeleteFinanceUserTagModal />
      <RenameFinanceUserTagModal />
    </template>

    <ErrorMessage v-if="errorFetchingUserTags">{{
      FINANCE_USER_TAGS_COPY.MANAGE_PAGE.FETCH_TAGS_ERROR
    }}</ErrorMessage>
  </PageLayout>
</template>

<style scoped>
.tag-select {
  max-width: max-content;
}
</style>
