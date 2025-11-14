/**
 * AULAPUDU 2.0 - SESSION ERROR
 */

import ApplicationError from './ApplicationError.js';

export class SessionError extends ApplicationError {
  constructor(message, code = 'SESSION_ERROR', details = {}) {
    super(message, code, details);
  }
}

export class SessionNotFoundError extends SessionError {
  constructor(sessionId) {
    super(
      `Session not found: ${sessionId}`,
      'SESSION_NOT_FOUND',
      { sessionId }
    );
  }
}

export class SessionFullError extends SessionError {
  constructor(sessionId) {
    super(
      'Session has reached maximum capacity',
      'SESSION_FULL',
      { sessionId }
    );
  }
}

export class SessionInactiveError extends SessionError {
  constructor(sessionId, status) {
    super(
      `Session is not active (status: ${status})`,
      'SESSION_INACTIVE',
      { sessionId, status }
    );
  }
}

export default SessionError;