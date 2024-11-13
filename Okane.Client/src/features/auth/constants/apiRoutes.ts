// Internal
const basePath = '/auth'

export const authAPIRoutes = {
  login: () => `${basePath}/login`,
  logout: () => `${basePath}/logout`,
  passwordRequirements: () => `${basePath}/password-requirements`,
  refreshToken: () => `${basePath}/refresh-token`,
  register: () => `${basePath}/register`,
  sendVerificationEmail: () => `${basePath}/send-verification-email`,
  verifyEmail: () => `${basePath}/verify-email`,
} as const
