/**
 * AULAPUDU 2.0 - DASHBOARD RENDERER
 * Funciones auxiliares de renderizado para el dashboard
 */

export default class DashboardRenderer {
  renderAttendees(attendees) {
    return attendees.map(attendee => `
      <div class="spectator-item">
        <div class="spectator-avatar" style="background-color: ${this.getAvatarColor(attendee.name)};">
          ${this.getAvatarInitials(attendee.name)}
        </div>
        <div class="spectator-info">
          <div class="spectator-name">${attendee.name}</div>
          <div class="spectator-time">${attendee.timeInSession || 'Ahora'}</div>
        </div>
        <div class="spectator-status ${attendee.status}"></div>
      </div>
    `).join('');
  }

  renderEmptyAttendees() {
    return `
      <div class="empty-attendees" style="text-align: center; padding: var(--spacing-xl); color: var(--text-secondary);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin: 0 auto var(--spacing-md);">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <p style="font-weight: var(--font-weight-medium);">No hay espectadores aún</p>
        <p style="font-size: var(--font-size-sm); margin-top: var(--spacing-xs);">Comparte el código de sesión</p>
      </div>
    `;
  }

  getAvatarInitials(name) {
    if (!name) return '?';
    const initials = name.split(' ').map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
  }

  getAvatarColor(name) {
    if (!name) return 'var(--color-accent)';
    
    const colors = [
      'var(--color-primary)',
      'var(--color-secondary)',
      'var(--color-accent)',
      'var(--color-success)',
      '#9b87f5',
      '#f97066'
    ];
    
    // Hash simple del nombre para color consistente
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
}