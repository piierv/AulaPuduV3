/**
 * AULAPUDU 2.0 - AUTH ERROR
 */

import ApplicationError from './ApplicationError.js';

export class AuthError extends ApplicationError {
  constructor(message, code = 'AUTH_ERROR', details = {}) {
    super(message, code, details);
  }
}

export class AuthenticationError extends AuthError {
  constructor(message = 'Authentication failed') {
    super(message, 'AUTHENTICATION_FAILED');
  }
}

export class AuthorizationError extends AuthError {
  constructor(resource, action) {
    super(
      `Not authorized to ${action} ${resource}`,
      'AUTHORIZATION_FAILED',
      { resource, action }
    );
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS');
  }
}

export default AuthError;