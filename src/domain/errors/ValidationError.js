/**
 * AULAPUDU 2.0 - VALIDATION ERROR
 */

import ApplicationError from './ApplicationError.js';

export class ValidationError extends ApplicationError {
  constructor(errors, details = {}) {
    const errorMessage = Array.isArray(errors) 
      ? errors.join(', ') 
      : errors;
    
    super(errorMessage, 'VALIDATION_ERROR', {
      ...details,
      errors: Array.isArray(errors) ? errors : [errors]
    });
  }

  get errors() {
    return this.details.errors;
  }
}

export default ValidationError;