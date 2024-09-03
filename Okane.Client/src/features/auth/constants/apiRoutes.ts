const basePath = '/auth'

export const authAPIRoutes = {
  login: {
    basePath,
    buildPath() {
      return `${basePath}/login`
    },
  },
  logout: {
    basePath,
    buildPath() {
      return `${basePath}/logout`
    },
  },
  refreshToken: {
    basePath,
    buildPath() {
      return `${basePath}/refresh-token`
    },
  },
  register: {
    basePath,
    buildPath() {
      return `${basePath}/register`
    },
  },
} as const
