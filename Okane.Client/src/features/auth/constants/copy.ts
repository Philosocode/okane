export const AUTH_COPY = {
  FORGOT_PASSWORD: 'I forgot my password.',
  LOGOUT: 'Logout',

  AUTH_FORM: {
    CONFIRM_PASSWORD: 'Confirm password',
    EMAIL: 'Email',
    LOGIN: 'Login',
    LOGIN_ERROR: 'Invalid email or password',
    NAME: 'Name',
    PASSWORD: 'Password',
    REGISTER: 'Register',
    REGISTER_ERROR: 'Error registering. Refresh the page and try again.',

    PASSWORD_REQUIREMENTS: {
      DIGIT: '1 digit',
      HEADING: 'Password requirements',
      LOWERCASE_LETTER: '1 lowercase letter',
      MATCHING_PASSWORDS: '"Confirm password" matches "Password"',
      MIN_LENGTH: (n: number) => `${n} or more characters`,
      NON_ALPHANUMERIC_SYMBOL: '1 non-alphanumeric symbol (e.g. @, $)',
      UPPERCASE_LETTER: '1 uppercase letter',
    },
  },

  RESET_PASSWORD: {
    HEADING: 'Reset Password',
    INVALID_URL: 'Invalid URL. Please request a new reset password email and try again.',
    RESET_ERROR:
      'Error resetting password. Please request a new reset password email and try again.',
    RESET_SUCCEEDED: {
      SUCCESS: 'Successfully reset password!',
      CLICK_HERE: 'Click here to login.',
    },
    SUBMIT_BUTTON: 'Reset Password',
  },

  SEND_RESET_PASSWORD_EMAIL: {
    ERROR: 'Error sending reset password email. Please try again later.',
    ENTER_YOUR_EMAIL: 'Enter your email to reset your password.',
    RESET_PASSWORD: 'Reset Password',
    SUCCESS: {
      HEADING: 'Sent email!',
      BODY: 'In a few minutes, you should receive an email to reset your password.',
    },
  },

  SUCCESSFULLY_REGISTERED: {
    HEADING: 'Successfully registered!',
    BODY: `Thanks for registering! In a few minutes, you should receive an email to verify your account.`,
  },

  VERIFY_EMAIL: {
    MISSING_EMAIL: 'Invalid verification link. Please retry clicking on the link in the email.',
    PLEASE_WAIT: 'Please wait...',
    SEND_VERIFICATION_EMAIL: {
      SUCCESS: 'Verification email sent! Please check your email.',
      ERROR: 'Error sending verification email. Please try again later.',
    },
    VERIFICATION_FAILED: {
      FAILED: 'Verification failed.',
      CLICK_HERE: 'Click here',
      RESEND: 'to re-send the verification email.',
    },
    VERIFICATION_SUCCEEDED: {
      SUCCEEDED: 'Verification succeeded!',
      CLICK_HERE_TO_LOGIN: 'Click here to login.',
    },
    VERIFYING_YOUR_EMAIL: 'Verifying Your Email',
  },
} as const
