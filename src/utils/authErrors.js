/**
 * Centralized mapping of auth errors (Supabase + network) to clear,
 * user-friendly messages for the Login / Register screens.
 */

const GENERIC_LOGIN_ERROR =
  'Could not sign you in. Please check your connection and try again.';
const GENERIC_SIGNUP_ERROR =
  'Could not create your account. Please check your connection and try again.';

/**
 * Get the most useful text from an arbitrary thrown value.
 * Handles Supabase AuthApiError objects, plain Errors, Response-style
 * payloads ({ message, error_description, msg, errors[] }) and strings.
 */
const extractMessage = (error) => {
  if (!error) return '';
  if (typeof error === 'string') return error;
  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message.trim();
  }
  if (typeof error.error_description === 'string' && error.error_description.trim()) {
    return error.error_description.trim();
  }
  if (typeof error.msg === 'string' && error.msg.trim()) {
    return error.msg.trim();
  }
  if (Array.isArray(error.errors) && error.errors.length > 0) {
    return extractMessage(error.errors[0]);
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

const patterns = [
  {
    test: /invalid login credentials/i,
    title: 'Incorrect email or password',
    message:
      'The email or password you entered is incorrect. Please check them and try again.',
  },
  {
    test: /email not confirmed/i,
    title: 'Email not verified',
    message:
      'Please verify your email address first. Check your inbox (and spam folder) for the verification link.',
  },
  {
    test: /(over request rate limit|rate limit)/i,
    title: 'Too many attempts',
    message:
      'You have tried too many times. Please wait a few minutes before trying again.',
  },
  {
    test: /user already registered|already been registered|duplicate key/i,
    title: 'Account already exists',
    message:
      'An account with this email already exists. Try signing in instead, or use the Forgot Password link.',
  },
  {
    test: /password should be at least|password.*too weak|weak password/i,
    title: 'Password too weak',
    message:
      'Your password is too weak. Please use at least 6 characters (mixing letters and numbers is recommended).',
  },
  {
    test: /invalid email|valid email is required|unable to validate email/i,
    title: 'Invalid email',
    message: 'The email address you entered is not valid. Please check it and try again.',
    field: 'email',
  },
  {
    test: /phone/i,
    title: 'Invalid phone number',
    message:
      'The phone number you entered is not valid. Use a format like +254 712 345 678.',
    field: 'phone',
  },
  {
    test: /(failed to fetch|networkerror|network request failed|fetch failed|load failed|timed? ?out|timeout|offline|internet connection|err_invalid_url|invalid url)/i,
    title: 'Connection problem',
    message:
      'We could not reach the server. Please check your internet connection and try again.',
  },
  {
    test: /(supabase url|supabase key|anon key|api key|configuration|env)/i,
    title: 'Configuration error',
    message:
      'The app is not configured correctly. Please contact support if this keeps happening.',
  },
  {
    test: /(signups? not allowed|email provider disabled)/i,
    title: 'Registration unavailable',
    message:
      'New registrations are temporarily disabled. Please contact support or try again later.',
  },
  {
    test: /(forbidden|unauthorized|401|403)/i,
    title: 'Access denied',
    message: 'You are not allowed to perform this action. Please contact support.',
  },
  {
    test: /(too many requests|429)/i,
    title: 'Too many attempts',
    message: 'Please wait a few minutes and try again.',
  },
  {
    test: /(internal server error|500|502|503|504)/i,
    title: 'Server error',
    message:
      'Something went wrong on our side. Please try again in a few moments.',
  },
];

/**
 * Convert any auth error into { title, message, field }.
 * `fallbackTitle` lets callers keep the right alert title ("Login Failed"
 * vs "Registration Failed").
 */
export const getAuthErrorInfo = (error, fallbackTitle = 'Something went wrong') => {
  const raw = extractMessage(error);
  const match = raw && patterns.find((p) => p.test.test(raw));

  const info = match
    ? { title: match.title, message: match.message, field: match.field || null, raw }
    : {
        title: fallbackTitle,
        message: raw || (fallbackTitle === 'Login Failed' ? GENERIC_LOGIN_ERROR : GENERIC_SIGNUP_ERROR),
        field: null,
        raw,
      };

  // Never leak raw jargon to the user if the message looks technical.
  if (!match && info.raw && /[(\[]|\bcode\b|\bstatus\b|\bnull\b|\bundefined\b|\bobject\b/i.test(info.raw) && info.raw.length > 80) {
    info.message = fallbackTitle === 'Login Failed' ? GENERIC_LOGIN_ERROR : GENERIC_SIGNUP_ERROR;
  }

  return info;
};

/** Map a Supabase/postgrest error to the form field it most likely belongs to. */
export const fieldForError = (error) => getAuthErrorInfo(error).field;

export default getAuthErrorInfo;
