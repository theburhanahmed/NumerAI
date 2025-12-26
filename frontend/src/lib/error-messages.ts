/**
 * Error Message System
 * 
 * Maps backend error codes to user-friendly error messages.
 * Provides actionable error messages categorized by type.
 */

export type ErrorCategory = 'validation' | 'network' | 'server' | 'auth' | 'permission' | 'notFound' | 'rateLimit' | 'unknown'

export interface ErrorInfo {
  message: string
  category: ErrorCategory
  actionable: boolean
  actionLabel?: string
  action?: () => void
}

/**
 * Maps error codes/messages to user-friendly messages
 */
const errorMessageMap: Record<string, ErrorInfo> = {
  // Validation errors
  'email_required': {
    message: 'Please enter your email address',
    category: 'validation',
    actionable: true,
  },
  'invalid_email': {
    message: 'Please enter a valid email address',
    category: 'validation',
    actionable: true,
  },
  'password_required': {
    message: 'Please enter your password',
    category: 'validation',
    actionable: true,
  },
  'password_too_short': {
    message: 'Password must be at least 6 characters long',
    category: 'validation',
    actionable: true,
  },
  'passwords_do_not_match': {
    message: 'Passwords do not match',
    category: 'validation',
    actionable: true,
  },
  'birth_date_required': {
    message: 'Please enter your birth date',
    category: 'validation',
    actionable: true,
  },
  'invalid_date': {
    message: 'Please enter a valid date',
    category: 'validation',
    actionable: true,
  },
  
  // Authentication errors
  'invalid_credentials': {
    message: 'Invalid email or password. Please try again',
    category: 'auth',
    actionable: true,
    actionLabel: 'Reset Password',
  },
  'token_expired': {
    message: 'Your session has expired. Please log in again',
    category: 'auth',
    actionable: true,
    actionLabel: 'Log In',
  },
  'unauthorized': {
    message: 'You need to be logged in to access this feature',
    category: 'auth',
    actionable: true,
    actionLabel: 'Log In',
  },
  'account_locked': {
    message: 'Your account has been temporarily locked. Please try again later or contact support',
    category: 'auth',
    actionable: true,
    actionLabel: 'Contact Support',
  },
  
  // Permission errors
  'insufficient_permissions': {
    message: 'You don\'t have permission to perform this action',
    category: 'permission',
    actionable: true,
    actionLabel: 'Upgrade Plan',
  },
  'subscription_required': {
    message: 'This feature requires a premium subscription',
    category: 'permission',
    actionable: true,
    actionLabel: 'Upgrade to Premium',
  },
  
  // Network errors
  'network_error': {
    message: 'Unable to connect to the server. Please check your internet connection',
    category: 'network',
    actionable: true,
    actionLabel: 'Retry',
  },
  'timeout': {
    message: 'The request took too long. Please try again',
    category: 'network',
    actionable: true,
    actionLabel: 'Retry',
  },
  
  // Server errors
  'server_error': {
    message: 'Something went wrong on our end. We\'re working on fixing it',
    category: 'server',
    actionable: false,
  },
  'service_unavailable': {
    message: 'The service is temporarily unavailable. Please try again later',
    category: 'server',
    actionable: true,
    actionLabel: 'Retry',
  },
  
  // Not found errors
  'not_found': {
    message: 'The requested resource was not found',
    category: 'notFound',
    actionable: true,
    actionLabel: 'Go Home',
  },
  'profile_not_found': {
    message: 'Profile not found. Please complete your profile first',
    category: 'notFound',
    actionable: true,
    actionLabel: 'Complete Profile',
  },
  
  // Rate limiting
  'rate_limit_exceeded': {
    message: 'Too many requests. Please wait a moment before trying again',
    category: 'rateLimit',
    actionable: true,
    actionLabel: 'Wait and Retry',
  },
}

/**
 * Extracts error code/message from various error formats
 */
function extractErrorCode(error: any): string | null {
  if (!error) return null
  
  // Check for error code in response data
  if (error.response?.data?.error_code) {
    return error.response.data.error_code
  }
  
  // Check for error message in response data
  if (error.response?.data?.error) {
    const errorMsg = error.response.data.error.toLowerCase().replace(/\s+/g, '_')
    return errorMsg
  }
  
  // Check for detail in response data
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail.toLowerCase().replace(/\s+/g, '_')
    return detail
  }
  
  // Check error message
  if (error.message) {
    const msg = error.message.toLowerCase().replace(/\s+/g, '_')
    return msg
  }
  
  return null
}

/**
 * Gets user-friendly error message from error object
 */
export function getErrorMessage(error: any): ErrorInfo {
  const errorCode = extractErrorCode(error)
  
  if (errorCode && errorMessageMap[errorCode]) {
    return errorMessageMap[errorCode]
  }
  
  // Check for partial matches
  if (errorCode) {
    for (const [key, value] of Object.entries(errorMessageMap)) {
      if (errorCode.includes(key) || key.includes(errorCode)) {
        return value
      }
    }
  }
  
  // Check HTTP status codes
  const status = error?.response?.status
  if (status) {
    switch (status) {
      case 400:
        return {
          message: 'Invalid request. Please check your input and try again',
          category: 'validation',
          actionable: true,
        }
      case 401:
        return {
          message: 'You need to be logged in to access this feature',
          category: 'auth',
          actionable: true,
          actionLabel: 'Log In',
        }
      case 403:
        return {
          message: 'You don\'t have permission to perform this action',
          category: 'permission',
          actionable: true,
        }
      case 404:
        return {
          message: 'The requested resource was not found',
          category: 'notFound',
          actionable: true,
          actionLabel: 'Go Home',
        }
      case 429:
        return {
          message: 'Too many requests. Please wait a moment before trying again',
          category: 'rateLimit',
          actionable: true,
          actionLabel: 'Wait and Retry',
        }
      case 500:
      case 502:
      case 503:
        return {
          message: 'Something went wrong on our end. We\'re working on fixing it',
          category: 'server',
          actionable: false,
        }
    }
  }
  
  // Default error
  return {
    message: 'An unexpected error occurred. Please try again',
    category: 'unknown',
    actionable: true,
    actionLabel: 'Retry',
  }
}

/**
 * Gets error message string (for simple use cases)
 */
export function getErrorString(error: any): string {
  return getErrorMessage(error).message
}

/**
 * Checks if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const errorInfo = getErrorMessage(error)
  return errorInfo.category === 'network' || errorInfo.category === 'server' || errorInfo.category === 'rateLimit'
}

