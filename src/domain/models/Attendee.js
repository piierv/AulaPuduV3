/**
 * AULAPUDU 2.0 - ATTENDEE MODEL
 * Modelo de dominio para asistentes/espectadores
 */

export class Attendee {
  static STATUS = {
    ACTIVE: 'active',
    DISCONNECTED: 'disconnected',
    KICKED: 'kicked'
  };

  constructor(data) {
    this.id = data.id || null;
    this.sessionId = data.session_id || data.sessionId;
    this.userId = data.user_id || data.userId || null;
    this.name = data.name;
    this.status = data.status || Attendee.STATUS.ACTIVE;
    this.metadata = data.metadata || {};
    this.joinedAt = data.joined_at ? new Date(data.joined_at) : new Date();
    this.leftAt = data.left_at ? new Date(data.left_at) : null;
    
    // Datos relacionados
    this.session = data.session || null;
    this.user = data.user || null;
  }

  /**
   * Crea un nuevo asistente
   */
  static create(data) {
    return new Attendee({
      ...data,
      status: Attendee.STATUS.ACTIVE,
      joined_at: new Date().toISOString()
    });
  }

  /**
   * Verifica si está activo
   */
  isActive() {
    return this.status === Attendee.STATUS.ACTIVE;
  }

  /**
   * Verifica si está desconectado
   */
  isDisconnected() {
    return this.status === Attendee.STATUS.DISCONNECTED;
  }

  /**
   * Verifica si fue expulsado
   */
  isKicked() {
    return this.status === Attendee.STATUS.KICKED;
  }

  /**
   * Marca como desconectado
   */
  disconnect() {
    this.status = Attendee.STATUS.DISCONNECTED;
    this.leftAt = new Date();
  }

  /**
   * Reconecta al asistente
   */
  reconnect() {
    if (!this.isDisconnected()) {
      throw new Error('Can only reconnect disconnected attendees');
    }

    this.status = Attendee.STATUS.ACTIVE;
    this.leftAt = null;
  }

  /**
   * Expulsa al asistente
   */
  kick() {
    this.status = Attendee.STATUS.KICKED;
    this.leftAt = new Date();
  }

  /**
   * Obtiene el tiempo en la sesión
   */
  getTimeInSession() {
    const endTime = this.leftAt || new Date();
    return endTime - this.joinedAt;
  }

  /**
   * Formatea el tiempo en la sesión
   */
  getFormattedTimeInSession() {
    const ms = this.getTimeInSession();
    const minutes = Math.floor(ms / 60000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    
    const hours = Math.floor(minutes / 60);
    return `Hace ${hours}h`;
  }

  /**
   * Actualiza metadata
   */
  updateMetadata(metadata) {
    this.metadata = {
      ...this.metadata,
      ...metadata
    };
  }

  /**
   * Obtiene las iniciales para el avatar
   */
  getInitials() {
    return this.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Convierte a objeto plano para la BD
   */
  toJSON() {
    return {
      id: this.id,
      session_id: this.sessionId,
      user_id: this.userId,
      name: this.name,
      status: this.status,
      metadata: this.metadata,
      joined_at: this.joinedAt.toISOString(),
      left_at: this.leftAt?.toISOString() || null
    };
  }

  /**
   * Convierte a objeto para la UI
   */
  toDTO() {
    return {
      id: this.id,
      sessionId: this.sessionId,
      userId: this.userId,
      name: this.name,
      status: this.status,
      isActive: this.isActive(),
      initials: this.getInitials(),
      timeInSession: this.getFormattedTimeInSession(),
      metadata: this.metadata,
      joinedAt: this.joinedAt.toISOString(),
      leftAt: this.leftAt?.toISOString()
    };
  }
}

export default Attendee;