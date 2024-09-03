const basePath = '/auth'
const apiRoutes = {
  LOGIN() {
    return `${basePath}/login`
  },
  LOGOUT() {
    return `${basePath}/logout`
  },
  REFRESH_TOKEN() {
    return `${basePath}/refresh-token`
  },
  REGISTER() {
    return `${basePath}/register`
  },
} as const

export const AUTH_API_ROUTES = apiRoutes
