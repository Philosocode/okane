// Internal
const basePath = '/auth'

export const authApiRoutes = {
  login: () => `${basePath}/login`,
  logout: () => `${basePath}/logout`,
  passwordRequirements: () => `${basePath}/password-requirements`,
  refreshToken: () => `${basePath}/refresh-token`,
  register: () => `${basePath}/register`,
  resetPassword: () => `${basePath}/reset-password`,
  self: () => `${basePath}/self`,
  sendResetPasswordEmail: () => `${basePath}/send-reset-password-email`,
  sendVerificationEmail: () => `${basePath}/send-verification-email`,
  verifyEmail: () => `${basePath}/verify-email`,
} as const
