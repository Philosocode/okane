// External
import { ref, type InjectionKey } from 'vue'

// Internal
import { FINANCE_RECORD_TYPE } from '@features/financeRecords/constants/saveFinanceRecord'

import { type FinanceUserTag } from '@features/financeUserTags/types/financeUserTag'

export type ManageFinanceUserTagsProvider = ReturnType<typeof useManageFinanceUserTagsProvider>

export const MANAGE_FINANCE_USER_TAGS_PROVIDER_SYMBOL =
  Symbol() as InjectionKey<ManageFinanceUserTagsProvider>

export function useManageFinanceUserTagsProvider() {
  const userTagToDelete = ref<FinanceUserTag>()
  const userTagToRename = ref<FinanceUserTag>()
  const userTagType = ref<FINANCE_RECORD_TYPE>(FINANCE_RECORD_TYPE.EXPENSE)

  function setUserTagToDelete(userTag?: FinanceUserTag) {
    userTagToDelete.value = userTag
  }

  function setUserTagToRename(userTag?: FinanceUserTag) {
    userTagToRename.value = userTag
  }

  function setUserTagType(type: FINANCE_RECORD_TYPE) {
    userTagType.value = type
  }

  return {
    get userTagToDelete() {
      return userTagToDelete.value
    },
    get userTagToRename() {
      return userTagToRename.value
    },
    get userTagType() {
      return userTagType.value
    },
    setUserTagToDelete,
    setUserTagType,
    setUserTagToRename,
  }
}
