/**
 * AULAPUDU 2.0 - SESSION MODEL
 * Modelo de dominio para sesiones
 */

import { SessionError, SessionInactiveError } from '../errors/SessionError.js';

export class Session {
  static STATUS = {
    ACTIVE: 'active',
    PAUSED: 'paused',
    ENDED: 'ended'
  };

  constructor(data) {
    this.id = data.id || null;
    this.code = data.code;
    this.title = data.title;
    this.presenterId = data.presenter_id || data.presenterId;
    this.status = data.status || Session.STATUS.ACTIVE;
    this.currentSlide = data.current_slide || data.currentSlide || 0;
    this.settings = data.settings || {};
    this.createdAt = data.created_at ? new Date(data.created_at) : new Date();
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : null;
    this.endedAt = data.ended_at ? new Date(data.ended_at) : null;
    
    // Datos relacionados (pueden venir de joins)
    this.attendees = data.attendees || [];
    this.presenter = data.presenter || null;
  }

  /**
   * Crea una nueva sesión
   */
  static create(data) {
    return new Session({
      ...data,
      status: Session.STATUS.ACTIVE,
      created_at: new Date().toISOString()
    });
  }

  /**
   * Verifica si la sesión está activa
   */
  isActive() {
    return this.status === Session.STATUS.ACTIVE;
  }

  /**
   * Verifica si la sesión está pausada
   */
  isPaused() {
    return this.status === Session.STATUS.PAUSED;
  }

  /**
   * Verifica si la sesión ha terminado
   */
  isEnded() {
    return this.status === Session.STATUS.ENDED;
  }

  /**
   * Verifica si se puede unir a la sesión
   */
  canJoin() {
    if (!this.isActive()) {
      return false;
    }

    // Verificar límite de asistentes
    if (this.settings.maxAttendees) {
      const activeAttendees = this.attendees.filter(
        a => a.status === 'active'
      ).length;
      
      return activeAttendees < this.settings.maxAttendees;
    }

    return true;
  }

  /**
   * Verifica si la sesión está llena
   */
  isFull() {
    if (!this.settings.maxAttendees) {
      return false;
    }

    const activeAttendees = this.attendees.filter(
      a => a.status === 'active'
    ).length;

    return activeAttendees >= this.settings.maxAttendees;
  }

  /**
   * Finaliza la sesión
   */
  end() {
    if (!this.isActive() && !this.isPaused()) {
      throw new SessionError('Cannot end a session that is already ended');
    }

    this.status = Session.STATUS.ENDED;
    this.endedAt = new Date();
  }

  /**
   * Pausa la sesión
   */
  pause() {
    if (!this.isActive()) {
      throw new SessionInactiveError(this.id, this.status);
    }

    this.status = Session.STATUS.PAUSED;
  }

  /**
   * Reanuda la sesión
   */
  resume() {
    if (!this.isPaused()) {
      throw new SessionError('Can only resume paused sessions');
    }

    this.status = Session.STATUS.ACTIVE;
  }

  /**
   * Cambia la diapositiva actual
   */
  setCurrentSlide(slideNumber) {
    if (typeof slideNumber !== 'number' || slideNumber < 0) {
      throw new SessionError('Invalid slide number');
    }

    this.currentSlide = slideNumber;
    this.updatedAt = new Date();
  }

  /**
   * Obtiene el número de asistentes activos
   */
  getActiveAttendeesCount() {
    return this.attendees.filter(a => a.status === 'active').length;
  }

  /**
   * Obtiene la duración de la sesión
   */
  getDuration() {
    const endTime = this.endedAt || new Date();
    return endTime - this.createdAt;
  }

  /**
   * Formatea la duración
   */
  getFormattedDuration() {
    const ms = this.getDuration();
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Actualiza configuración
   */
  updateSettings(settings) {
    this.settings = {
      ...this.settings,
      ...settings
    };
    this.updatedAt = new Date();
  }

  /**
   * Convierte a objeto plano para la BD
   */
  toJSON() {
    return {
      id: this.id,
      code: this.code,
      title: this.title,
      presenter_id: this.presenterId,
      status: this.status,
      current_slide: this.currentSlide,
      settings: this.settings,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt?.toISOString() || null,
      ended_at: this.endedAt?.toISOString() || null
    };
  }

  /**
   * Convierte a objeto para la UI
   */
  toDTO() {
    return {
      id: this.id,
      code: this.code,
      title: this.title,
      presenterId: this.presenterId,
      status: this.status,
      currentSlide: this.currentSlide,
      settings: this.settings,
      isActive: this.isActive(),
      canJoin: this.canJoin(),
      activeAttendeesCount: this.getActiveAttendeesCount(),
      duration: this.getFormattedDuration(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt?.toISOString(),
      endedAt: this.endedAt?.toISOString()
    };
  }
}

export default Session;