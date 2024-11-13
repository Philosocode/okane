const queryKeys = {
  all: () => ['auth'],
  passwordRequirements: () => [...queryKeys.all(), 'passwordRequirements'],
}

export const authQueryKeys = queryKeys
