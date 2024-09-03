const basePath = '/auth'
const apiRoutes = {
  LOGIN: {
    basePath,
    buildPath() {
      return `${basePath}/login`
    },
  },
  LOGOUT: {
    basePath,
    buildPath() {
      return `${basePath}/logout`
    },
  },
  REFRESH_TOKEN: {
    basePath,
    buildPath() {
      return `${basePath}/refresh-token`
    },
  },
  REGISTER: {
    basePath,
    buildPath() {
      return `${basePath}/register`
    },
  },
} as const

export const AUTH_API_ROUTES = apiRoutes
