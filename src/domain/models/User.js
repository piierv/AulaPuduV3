/**
 * AULAPUDU 2.0 - USER MODEL
 * Modelo de dominio para usuarios
 */

export class User {
  static ROLES = {
    PRESENTER: 'presenter',
    SPECTATOR: 'spectator',
    ADMIN: 'admin'
  };

  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.displayName = data.display_name || data.displayName || this.email.split('@')[0];
    this.role = data.role || User.ROLES.SPECTATOR;
    this.avatarUrl = data.avatar_url || data.avatarUrl || null;
    this.metadata = data.metadata || {};
    this.createdAt = data.created_at ? new Date(data.created_at) : new Date();
    this.updatedAt = data.updated_at ? new Date(data.updated_at) : null;
  }

  /**
   * Verifica si es presentador
   */
  isPresenter() {
    return this.role === User.ROLES.PRESENTER;
  }

  /**
   * Verifica si es espectador
   */
  isSpectator() {
    return this.role === User.ROLES.SPECTATOR;
  }

  /**
   * Verifica si es admin
   */
  isAdmin() {
    return this.role === User.ROLES.ADMIN;
  }

  /**
   * Verifica si tiene un rol específico
   */
  hasRole(role) {
    return this.role === role;
  }

  /**
   * Verifica si tiene alguno de los roles
   */
  hasAnyRole(roles) {
    return roles.includes(this.role);
  }

  /**
   * Obtiene las iniciales
   */
  getInitials() {
    return this.displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Actualiza el perfil
   */
  updateProfile(data) {
    if (data.displayName !== undefined) this.displayName = data.displayName;
    if (data.avatarUrl !== undefined) this.avatarUrl = data.avatarUrl;
    if (data.metadata !== undefined) {
      this.metadata = {
        ...this.metadata,
        ...data.metadata
      };
    }
    
    this.updatedAt = new Date();
  }

  /**
   * Convierte a objeto plano para la BD
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      display_name: this.displayName,
      role: this.role,
      avatar_url: this.avatarUrl,
      metadata: this.metadata,
      created_at: this.createdAt.toISOString(),
      updated_at: this.updatedAt?.toISOString() || null
    };
  }

  /**
   * Convierte a objeto para la UI
   */
  toDTO() {
    return {
      id: this.id,
      email: this.email,
      displayName: this.displayName,
      role: this.role,
      avatarUrl: this.avatarUrl,
      initials: this.getInitials(),
      isPresenter: this.isPresenter(),
      isSpectator: this.isSpectator(),
      isAdmin: this.isAdmin(),
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt?.toISOString()
    };
  }
}

export default User;