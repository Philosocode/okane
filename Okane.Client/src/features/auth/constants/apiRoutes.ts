// Internal
const basePath = '/auth'

export const authAPIRoutes = {
  login: () => `${basePath}/login`,
  logout: () => `${basePath}/logout`,
  passwordRequirements: () => `${basePath}/password-requirements`,
  refreshToken: () => `${basePath}/refresh-token`,
  register: () => `${basePath}/register`,
  resetPassword: () => `${basePath}/reset-password`,
  sendResetPasswordEmail: () => `${basePath}/send-reset-password-email`,
  sendVerificationEmail: () => `${basePath}/send-verification-email`,
  verifyEmail: () => `${basePath}/verify-email`,
} as const
