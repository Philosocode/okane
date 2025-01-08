const queryKeys = {
  all: () => ['financeUserTags'],
  lists: () => [...queryKeys.all(), 'lists'],
  listAll: () => [...queryKeys.lists(), 'all'],
}

export const financeUserTagQueryKeys = queryKeys
