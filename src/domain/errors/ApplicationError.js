/**
 * AULAPUDU 2.0 - APPLICATION ERROR
 * Clase base para todos los errores de la aplicación
 */

export class ApplicationError extends Error {
  constructor(message, code = 'APPLICATION_ERROR', details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    // Mantener stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

export default ApplicationError;