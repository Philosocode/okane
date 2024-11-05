export const AUTH_COPY = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  REGISTER: 'Register',

  AUTH_FORM: {
    CONFIRM_PASSWORD: 'Confirm password',
    EMAIL: 'Email',
    NAME: 'Name',
    PASSWORD: 'Password',
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
