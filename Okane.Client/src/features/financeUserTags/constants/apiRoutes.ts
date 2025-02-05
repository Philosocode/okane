// Internal
const basePath = '/finance-user-tags'

export const financeUserTagApiRoutes = {
  getAll: () => basePath,
  delete: ({ id }: { id: number }) => `${basePath}/${id}`,
  post: () => basePath,
  rename: ({ id }: { id: number }) => `${basePath}/${id}/rename`,
} as const
