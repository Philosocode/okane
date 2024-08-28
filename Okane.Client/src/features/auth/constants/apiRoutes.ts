const apiRoutes = {
  LOGIN: {
    basePath: '/auth/login',
    buildPath() {
      return apiRoutes.LOGIN.basePath
    },
  },
  LOGOUT: {
    basePath: '/auth/logout',
    buildPath() {
      return apiRoutes.LOGOUT.basePath
    },
  },
  REFRESH_TOKEN: {
    basePath: '/auth/refresh-token',
    buildPath() {
      return apiRoutes.REFRESH_TOKEN.basePath
    },
  },
  REGISTER: {
    basePath: '/auth/register',
    buildPath() {
      return apiRoutes.REGISTER.basePath
    },
  },
} as const

export const AUTH_API_ROUTES = apiRoutes
