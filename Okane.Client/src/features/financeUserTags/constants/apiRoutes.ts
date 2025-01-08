// Internal
const basePath = '/finance-user-tags'

export const financeUserTagAPIRoutes = {
  getAll: () => basePath,
  delete: ({ id }: { id: number }) => `${basePath}/${id}`,
  post: () => basePath,
  rename: ({ id }: { id: number }) => `${basePath}/${id}/rename`,
} as const
