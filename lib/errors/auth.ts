import { AppError } from './base';

export class AuthError extends AppError {
  constructor(
    message = 'Authentication failed',
    code = 'AUTH_ERROR',
    status = 401,
    data?: unknown
  ) {
    super(message, code, status, data);
    this.name = 'AuthError';
  }

  static credentialsInvalid(): AuthError {
    return new AuthError('Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
  }

  static sessionExpired(): AuthError {
    return new AuthError('Your session has expired', 'AUTH_SESSION_EXPIRED');
  }

  static unauthorized(): AuthError {
    return new AuthError('You are not authorized to perform this action', 'AUTH_UNAUTHORIZED');
  }
} 