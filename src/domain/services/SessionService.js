/**
 * AULAPUDU 2.0 - SESSION SERVICE (REFACTORIZADO)
 * Servicio de gestión de sesiones con arquitectura limpia
 */

import Session from '../models/Session.js';
import Attendee from '../models/Attendee.js';
import { CreateSessionValidator, JoinSessionValidator } from '../validators/SessionValidator.js';
import { liveSessionManager } from '../../services/LiveSessionManager.js';
import { ValidationError } from '../errors/ValidationError.js';
import { SessionFullError, SessionInactiveError } from '../errors/SessionError.js';

export class SessionService {
  constructor(sessionRepository, attendeeRepository, eventBus, logger) {
    this.sessionRepository = sessionRepository;
    this.attendeeRepository = attendeeRepository;
    this.eventBus = eventBus;
    this.logger = logger.createChild({ context: 'SessionService' });
    this.currentSession = null;
  }

  /**
   * Crea una nueva sesión
   */
  async createSession(createSessionDTO) {
    this.logger.info('Creating session', { title: createSessionDTO.title });

    try {
      // Validación
      const validator = new CreateSessionValidator();
      if (!validator.validate(createSessionDTO)) {
        throw new ValidationError(validator.getErrors());
      }

      // Crear modelo de sesión
      const session = Session.create({
        title: createSessionDTO.title,
        presenterId: createSessionDTO.presenterId,
        code: liveSessionManager.generateSessionCode(),
        settings: createSessionDTO.settings || {}
      });

      // Persistir
      const savedSession = await this.sessionRepository.save(session);
      this.currentSession = savedSession;

      // Emitir evento
      this.eventBus.emit('session:created', {
        session: savedSession.toDTO(),
        code: savedSession.code
      });

      this.logger.info('Session created successfully', {
        sessionId: savedSession.id,
        code: savedSession.code
      });

      return {
        success: true,
        session: savedSession.toDTO(),
        code: savedSession.code
      };
    } catch (error) {
      this.logger.error('Failed to create session', error);
      
      if (error instanceof ValidationError) {
        throw error;
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Une un espectador a una sesión
   */
  async joinSession(code, attendeeName) {
    this.logger.info('Joining session', { code, attendeeName });

    try {
      // Validación
      const validator = new JoinSessionValidator();
      if (!validator.validate({ code, attendeeName })) {
        throw new ValidationError(validator.getErrors());
      }

      // Buscar sesión
      const session = await this.sessionRepository.findByCode(code.toUpperCase());

      // Verificar si puede unirse
      if (!session.isActive()) {
        throw new SessionInactiveError(session.id, session.status);
      }

      if (!session.canJoin()) {
        throw new SessionFullError(session.id);
      }

      // Crear asistente
      const attendee = Attendee.create({
        sessionId: session.id,
        name: attendeeName
      });

      const savedAttendee = await this.attendeeRepository.save(attendee);

      // Emitir evento
      this.eventBus.emit('session:joined', {
        session: session.toDTO(),
        attendee: savedAttendee.toDTO()
      });

      this.logger.info('Joined session successfully', {
        sessionId: session.id,
        attendeeId: savedAttendee.id
      });

      return {
        success: true,
        sessionId: session.id,
        attendeeId: savedAttendee.id,
        session: session.toDTO()
      };
    } catch (error) {
      this.logger.error('Failed to join session', error, { code });

      if (error instanceof ValidationError) {
        throw error;
      }

      if (error instanceof SessionInactiveError) {
        return {
          success: false,
          error: 'SESSION_INACTIVE'
        };
      }

      if (error instanceof SessionFullError) {
        return {
          success: false,
          error: 'SESSION_FULL'
        };
      }

      return {
        success: false,
        error: error.code || 'SESSION_NOT_FOUND'
      };
    }
  }

  /**
   * Obtiene información de una sesión
   */
  async getSession(sessionId) {
    this.logger.debug('Getting session', { sessionId });

    try {
      const session = await this.sessionRepository.findById(sessionId);
      
      return {
        success: true,
        session: session.toDTO()
      };
    } catch (error) {
      this.logger.error('Failed to get session', error, { sessionId });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene todas las sesiones de un presentador
   */
  async getPresenterSessions(presenterId, filters = {}) {
    this.logger.debug('Getting presenter sessions', { presenterId });

    try {
      const sessions = await this.sessionRepository.findAll({
        presenterId,
        ...filters
      });

      return {
        success: true,
        sessions: sessions.map(s => s.toDTO())
      };
    } catch (error) {
      this.logger.error('Failed to get presenter sessions', error, { presenterId });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene asistentes de una sesión
   */
  async getSessionAttendees(sessionId, activeOnly = false) {
    this.logger.debug('Getting session attendees', { sessionId, activeOnly });

    try {
      const attendees = activeOnly
        ? await this.attendeeRepository.findActiveBySessionId(sessionId)
        : await this.attendeeRepository.findBySessionId(sessionId);

      return {
        success: true,
        attendees: attendees.map(a => a.toDTO())
      };
    } catch (error) {
      this.logger.error('Failed to get attendees', error, { sessionId });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Actualiza la diapositiva actual
   */
  async updateCurrentSlide(sessionId, slideNumber) {
    this.logger.debug('Updating current slide', { sessionId, slideNumber });

    try {
      const session = await this.sessionRepository.findById(sessionId);
      
      session.setCurrentSlide(slideNumber);
      const updatedSession = await this.sessionRepository.update(session);

      // Emitir evento para sincronización en tiempo real
      this.eventBus.emit('session:slideChanged', {
        sessionId: session.id,
        slideNumber
      });

      return {
        success: true,
        session: updatedSession.toDTO()
      };
    } catch (error) {
      this.logger.error('Failed to update slide', error, { sessionId });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Pausa una sesión
   */
  async pauseSession(sessionId) {
    this.logger.info('Pausing session', { sessionId });

    try {
      const session = await this.sessionRepository.findById(sessionId);
      
      session.pause();
      const updatedSession = await this.sessionRepository.update(session);

      this.eventBus.emit('session:paused', {
        sessionId: session.id
      });

      this.logger.info('Session paused', { sessionId });

      return {
        success: true,
        session: updatedSession.toDTO()
      };
    } catch (error) {
      this.logger.error('Failed to pause session', error, { sessionId });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reanuda una sesión
   */
  async resumeSession(sessionId) {
    this.logger.info('Resuming session', { sessionId });

    try {
      const session = await this.sessionRepository.findById(sessionId);
      
      session.resume();
      const updatedSession = await this.sessionRepository.update(session);

      this.eventBus.emit('session:resumed', {
        sessionId: session.id
      });

      this.logger.info('Session resumed', { sessionId });

      return {
        success: true,
        session: updatedSession.toDTO()
      };
    } catch (error) {
      this.logger.error('Failed to resume session', error, { sessionId });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Finaliza una sesión
   */
  async endSession(sessionId) {
    this.logger.info('Ending session', { sessionId });

    try {
      const session = await this.sessionRepository.findById(sessionId);
      
      session.end();
      const updatedSession = await this.sessionRepository.update(session);

      // Marcar todos los asistentes como desconectados
      await this.attendeeRepository.disconnectAllBySessionId(sessionId);

      // Emitir evento
      this.eventBus.emit('session:ended', {
        sessionId: session.id
      });

      this.logger.info('Session ended', { sessionId });

      if (this.currentSession?.id === sessionId) {
        this.currentSession = null;
      }

      return {
        success: true,
        session: updatedSession.toDTO()
      };
    } catch (error) {
      this.logger.error('Failed to end session', error, { sessionId });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Expulsa un asistente
   */
  async kickAttendee(attendeeId) {
    this.logger.info('Kicking attendee', { attendeeId });

    try {
      const attendee = await this.attendeeRepository.findById(attendeeId);
      
      attendee.kick();
      await this.attendeeRepository.update(attendee);

      this.eventBus.emit('attendee:kicked', {
        attendeeId: attendee.id,
        sessionId: attendee.sessionId
      });

      this.logger.info('Attendee kicked', { attendeeId });

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to kick attendee', error, { attendeeId });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene estadísticas de una sesión
   */
  async getSessionStats(sessionId) {
    this.logger.debug('Getting session stats', { sessionId });

    try {
      const session = await this.sessionRepository.findById(sessionId);
      const attendees = await this.attendeeRepository.findBySessionId(sessionId);

      const activeCount = attendees.filter(a => a.isActive()).length;
      const totalCount = attendees.length;
      const disconnectedCount = attendees.filter(a => a.isDisconnected()).length;

      return {
        success: true,
        stats: {
          activeAttendees: activeCount,
          totalAttendees: totalCount,
          disconnectedAttendees: disconnectedCount,
          duration: session.getFormattedDuration(),
          currentSlide: session.currentSlide,
          status: session.status
        }
      };
    } catch (error) {
      this.logger.error('Failed to get session stats', error, { sessionId });
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obtiene la sesión actual
   */
  getCurrentSession() {
    return this.currentSession ? this.currentSession.toDTO() : null;
  }

  /**
   * Limpia la sesión actual
   */
  clearCurrentSession() {
    this.currentSession = null;
  }
}

export default SessionService;