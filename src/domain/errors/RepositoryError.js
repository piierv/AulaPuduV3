/**
 * AULAPUDU 2.0 - REPOSITORY ERROR
 */

import ApplicationError from './ApplicationError.js';

export class RepositoryError extends ApplicationError {
  constructor(message, originalError = null, details = {}) {
    super(message, 'REPOSITORY_ERROR', {
      ...details,
      originalError: originalError ? {
        message: originalError.message,
        code: originalError.code
      } : null
    });
  }
}

export default RepositoryError;