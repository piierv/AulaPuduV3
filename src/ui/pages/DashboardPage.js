export default class DashboardPage {
  constructor(eventBus, sessionService, authService, dashboardRenderer, liveSessionManager, data) {
    this.eventBus = eventBus;
    this.sessionService = sessionService;
    this.authService = authService;
    this.dashboardRenderer = dashboardRenderer;
    this.liveSessionManager = liveSessionManager;
    this.data = data;
    
    // Estado
    this.currentUser = null;
    this.currentSession = null;
    this.presentations = [];
    this.recentSessions = [];
    this.attendees = [];
    this.stats = {
      totalPresentations: 0,
      totalSessions: 0,
      totalSpectators: 0,
      activeSessions: 0
    };
    
    // UI State
    this.leftSidebarCollapsed = false;
    this.rightSidebarCollapsed = true;
    this.loading = true;
    this.currentView = 'home'; // 'home', 'presentations', 'sessions'
  }

  async mount(container) {
    // Cargar datos iniciales
    await this.loadInitialData();
    
    // Renderizar
    container.innerHTML = this.render();
    
    // Event listeners
    this.attachEventListeners(container);
    
    // Suscribirse a eventos
    this.subscribeToEvents();
    
    // Polling para actualizar datos (cada 30 segundos)
    this.startPolling();
  }

  async loadInitialData() {
    try {
      this.loading = true;
      
      // Usuario actual
      this.currentUser = this.authService.getCurrentUser();
      
      if (!this.currentUser) {
        this.eventBus.emit('navigate', { view: 'login' });
        return;
      }

      // Sesión actual (si existe)
      this.currentSession = this.sessionService.getCurrentSession();
      
      // Cargar datos en paralelo
      await Promise.all([
        this.loadPresentations(),
        this.loadRecentSessions(),
        this.loadStats()
      ]);

      // Si hay sesión activa, cargar asistentes
      if (this.currentSession) {
        await this.loadAttendees();
      }

      this.loading = false;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showNotification('error', 'Error al cargar datos del dashboard');
      this.loading = false;
    }
  }

  async loadPresentations() {
    try {
      // TODO: Implementar PresentationService
      // Por ahora, datos de ejemplo
      this.presentations = [
        {
          id: 1,
          title: 'Introducción a Cálculo',
          slideCount: 24,
          thumbnailUrl: '/assets/thumbs/calc.jpg',
          lastUsed: new Date('2024-01-15'),
          createdAt: new Date('2024-01-10')
        },
        {
          id: 2,
          title: 'Álgebra Lineal - Vectores',
          slideCount: 18,
          thumbnailUrl: '/assets/thumbs/algebra.jpg',
          lastUsed: new Date('2024-01-12'),
          createdAt: new Date('2024-01-05')
        }
      ];
    } catch (error) {
      console.error('Error loading presentations:', error);
    }
  }

  async loadRecentSessions() {
    try {
      const result = await this.sessionService.getPresenterSessions(
        this.currentUser.id,
        { limit: 5 }
      );
      
      if (result.success) {
        this.recentSessions = result.sessions;
      }
    } catch (error) {
      console.error('Error loading recent sessions:', error);
    }
  }

  async loadStats() {
    try {
      // Cargar estadísticas del presentador
      // TODO: Implementar endpoint de stats
      this.stats = {
        totalPresentations: this.presentations.length,
        totalSessions: this.recentSessions.length,
        totalSpectators: 156, // Ejemplo
        activeSessions: this.currentSession ? 1 : 0
      };
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async loadAttendees() {
    try {
      const result = await this.sessionService.getSessionAttendees(
        this.currentSession.id,
        true // solo activos
      );
      
      if (result.success) {
        this.attendees = result.attendees;
      }
    } catch (error) {
      console.error('Error loading attendees:', error);
    }
  }

  render() {
    if (this.loading) {
      return this.renderLoading();
    }

    return `
      <div class="dashboard-layout">
        ${this.renderLeftSidebar()}
        
        <div class="dashboard-main dashboard-main-presenter ${this.leftSidebarCollapsed ? 'sidebar-collapsed' : ''} ${this.rightSidebarCollapsed ? 'right-sidebar-collapsed' : ''}">
          ${this.renderTopbar()}
          ${this.renderMainContent()}
        </div>

        ${this.renderRightSidebar()}
      </div>

      ${this.renderToggleButtons()}
    `;
  }

  renderLoading() {
    return `
      <div class="dashboard-layout">
        <div class="loading-screen" style="position: relative;">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <h2>Cargando Dashboard...</h2>
          </div>
        </div>
      </div>
    `;
  }

  renderLeftSidebar() {
    return `
      <nav class="sidebar sidebar-presenter ${this.leftSidebarCollapsed ? 'collapsed' : ''}">
        <div class="sidebar-header">
          <div class="sidebar-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
        </div>

        <ul class="sidebar-menu">
          <li class="sidebar-menu-item ${this.currentView === 'home' ? 'active' : ''}">
            <button class="sidebar-link" data-action="nav-home">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              <span>INICIO</span>
            </button>
          </li>

          <li class="sidebar-menu-item ${this.currentView === 'presentations' ? 'active' : ''}">
            <button class="sidebar-link" data-action="nav-presentations">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              <span>PRESENTACIONES</span>
            </button>
          </li>

          <li class="sidebar-menu-item ${this.currentView === 'sessions' ? 'active' : ''}">
            <button class="sidebar-link" data-action="nav-sessions">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              <span>SESIONES</span>
            </button>
          </li>
        </ul>

        <div class="sidebar-footer">
          <button class="sidebar-link" data-action="logout">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>SALIR</span>
          </button>
        </div>
      </nav>
    `;
  }

  renderTopbar() {
    const userName = this.currentUser?.displayName || 'Presentador';
    
    return `
      <div class="dashboard-topbar dashboard-topbar-presenter">
        <div class="dashboard-topbar-left">
          <h1 class="dashboard-topbar-title">
            ${this.getTopbarTitle()}
          </h1>
        </div>

        <div class="dashboard-topbar-right">
          ${!this.currentSession ? `
            <button class="btn btn-primary btn-sm" data-action="create-session">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Nueva Sesión
            </button>
          ` : `
            <button class="btn btn-accent btn-sm" data-action="end-session">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
              Finalizar Sesión
            </button>
          `}
          
          <div class="user-avatar-small" data-action="user-menu">
            ${this.getAvatarInitials(userName)}
          </div>
        </div>
      </div>
    `;
  }

  getTopbarTitle() {
    if (this.currentSession) {
      return `Sesión Activa: ${this.currentSession.title}`;
    }
    
    switch (this.currentView) {
      case 'home': return 'Mi Dashboard';
      case 'presentations': return 'Mis Presentaciones';
      case 'sessions': return 'Historial de Sesiones';
      default: return 'Dashboard';
    }
  }

  renderMainContent() {
    switch (this.currentView) {
      case 'home':
        return this.renderHomeView();
      case 'presentations':
        return this.renderPresentationsView();
      case 'sessions':
        return this.renderSessionsView();
      default:
        return this.renderHomeView();
    }
  }

  renderHomeView() {
    return `
      <div class="dashboard-content">
        <!-- Welcome Section -->
        <div class="welcome-section">
          <h2>¡Hola, ${this.currentUser?.displayName || 'Presentador'}!</h2>
          <p>${this.currentSession ? 'Tienes una sesión activa' : 'Comienza una nueva sesión interactiva'}</p>
        </div>

        <!-- Session Status -->
        ${this.currentSession ? this.renderActiveSessionCard() : this.renderNoSessionCard()}

        <!-- Quick Stats -->
        ${this.renderStatsGrid()}

        <!-- Quick Actions -->
        ${this.renderQuickActions()}

        <!-- Recent Sessions -->
        ${this.renderRecentSessions()}
      </div>
    `;
  }

  renderActiveSessionCard() {
    return `
      <div class="session-active-card animate-fade-in">
        <div class="session-active-header">
          <h3>🎯 Sesión Activa</h3>
          <span class="session-status active">EN VIVO</span>
        </div>
        <div class="session-active-info">
          <p><strong>${this.currentSession.title}</strong></p>
          <div class="session-meta">
            <span>👥 ${this.attendees.length} espectadores</span>
            <span>•</span>
            <span>⏱️ ${this.currentSession.duration}</span>
          </div>
          <div class="session-code-container">
            <div class="session-code-qr" id="qrcode"></div>
            <div class="session-code-text">
                <p class="session-code-large">Código: ${this.currentSession.code}</p>
            </div>
          </div>
          <div class="session-actions">
            <button class="btn btn-primary btn-sm" data-action="open-session">
              Abrir Sesión
            </button>
            <button class="btn btn-outline btn-sm" data-action="copy-code">
              Copiar Código
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderNoSessionCard() {
    return `
      <div class="no-session-card animate-fade-in">
        <div class="no-session-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="1">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <h3>No hay sesión activa</h3>
        <p>Crea una nueva sesión para comenzar a interactuar con estudiantes</p>
        <button class="btn btn-primary btn-lg" data-action="create-session">
          Crear Nueva Sesión
        </button>
      </div>
    `;
  }

  renderStatsGrid() {
    return `
      <div class="stats-grid animate-slide-in-up">
        <div class="stat-card">
          <div class="stat-icon" style="background: var(--color-primary-light);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${this.stats.totalPresentations}</div>
            <div class="stat-label">Presentaciones</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: var(--color-secondary-light);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${this.stats.totalSessions}</div>
            <div class="stat-label">Sesiones</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(136, 193, 178, 0.2);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${this.stats.totalSpectators}</div>
            <div class="stat-label">Espectadores Totales</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(244, 165, 130, 0.2);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">${this.stats.activeSessions}</div>
            <div class="stat-label">Sesiones Activas</div>
          </div>
        </div>
      </div>
    `;
  }

  renderQuickActions() {
    return `
      <div style="margin-top: var(--spacing-2xl);">
        <h3 style="margin-bottom: var(--spacing-lg);">⚡ Acciones Rápidas</h3>
        <div class="quick-actions-grid">
          <button class="quick-action-card" data-action="create-session">
            <div class="quick-action-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <span>Nueva Sesión</span>
          </button>

          <button class="quick-action-card" data-action="create-presentation">
            <div class="quick-action-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <span>Nueva Presentación</span>
          </button>

          <button class="quick-action-card" data-action="nav-sessions">
            <div class="quick-action-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <span>Ver Historial</span>
          </button>

          <button class="quick-action-card" data-action="user-menu">
            <div class="quick-action-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"></path>
                <path d="M12 14c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z"></path>
              </svg>
            </div>
            <span>Mi Perfil</span>
          </button>
        </div>
      </div>
    `;
  }

  renderRecentSessions() {
    if (this.recentSessions.length === 0) {
      return '';
    }

    return `
      <div style="margin-top: var(--spacing-2xl);">
        <h3 style="margin-bottom: var(--spacing-lg);">📊 Sesiones Recientes</h3>
        <div class="dashboard-grid">
          ${this.recentSessions.map(session => `
            <div class="card">
              <div class="card-header">
                <h4 class="card-title">${session.title}</h4>
                <span class="session-status ${session.status}">${this.getStatusLabel(session.status)}</span>
              </div>
              <div class="card-body">
                <div class="session-meta">
                  <span>🔢 Código: ${session.code}</span>
                  <span>👥 ${session.activeAttendeesCount} asistentes</span>
                  <span>⏱️ ${session.duration}</span>
                </div>
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-top: var(--spacing-sm);">
                  ${new Date(session.createdAt).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderPresentationsView() {
    return `
      <div class="dashboard-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xl);">
          <h2>Mis Presentaciones</h2>
          <button class="btn btn-primary" data-action="create-presentation">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Nueva Presentación
          </button>
        </div>

        ${this.presentations.length > 0 ? `
          <div class="dashboard-grid">
            ${this.presentations.map(pres => `
              <div class="presentation-card">
                <div class="presentation-thumbnail">
                  <img src="${pres.thumbnailUrl || '/assets/default-thumb.jpg'}" alt="${pres.title}" 
                       onerror="this.src='/assets/default-thumb.jpg'">
                  <div class="presentation-overlay">
                    <button class="btn btn-primary btn-sm" data-action="select-presentation" data-id="${pres.id}">
                      Usar en Sesión
                    </button>
                  </div>
                </div>
                <div class="presentation-info">
                  <h4 class="presentation-title">${pres.title}</h4>
                  <div class="presentation-meta">
                    <span>📊 ${pres.slideCount} diapositivas</span>
                    <span>📅 ${new Date(pres.lastUsed).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="no-session-card">
            <h3>No tienes presentaciones</h3>
            <p>Crea tu primera presentación para comenzar</p>
            <button class="btn btn-primary btn-lg" data-action="create-presentation">
              Crear Presentación
            </button>
          </div>
        `}
      </div>
    `;
  }

  renderSessionsView() {
    return `
      <div class="dashboard-content">
        <h2 style="margin-bottom: var(--spacing-xl);">Historial de Sesiones</h2>
        
        ${this.recentSessions.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: var(--spacing-lg);">
            ${this.recentSessions.map(session => `
              <div class="card">
                <div class="card-header">
                  <div>
                    <h4 class="card-title">${session.title}</h4>
                    <p style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                      ${new Date(session.createdAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <span class="session-status ${session.status}">${this.getStatusLabel(session.status)}</span>
                </div>
                <div class="card-body">
                  <div class="session-meta" style="display: flex; gap: var(--spacing-lg);">
                    <span>🔢 Código: <strong>${session.code}</strong></span>
                    <span>👥 ${session.activeAttendeesCount} asistentes</span>
                    <span>⏱️ Duración: ${session.duration}</span>
                  </div>
                </div>
                <div class="card-footer">
                  <button class="btn btn-sm btn-outline" data-action="view-session-details" data-id="${session.id}">
                    Ver Detalles
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="no-session-card">
            <h3>No hay sesiones recientes</h3>
            <p>Crea una sesión para comenzar a interactuar</p>
            <button class="btn btn-primary btn-lg" data-action="create-session">
              Crear Primera Sesión
            </button>
          </div>
        `}
      </div>
    `;
  }

  renderRightSidebar() {
    return `
      <aside class="spectator-panel spectator-panel-presenter ${this.rightSidebarCollapsed ? 'collapsed' : ''}">
        <div class="spectator-panel-header">
          <h3>👥 ESPECTADORES</h3>
          <span class="spectator-count">${this.attendees.length}</span>
        </div>

        <div class="spectator-list">
          ${this.attendees.length > 0 
            ? this.dashboardRenderer.renderAttendees(this.attendees) 
            : this.dashboardRenderer.renderEmptyAttendees()}
        </div>

        ${this.currentSession ? `
          <div class="spectator-panel-footer">
            <div class="session-code-display">
              <strong>CÓDIGO: ${this.currentSession.code}</strong>
            </div>
            <button class="btn btn-sm btn-outline w-full" data-action="copy-code">
              Copiar Código
            </button>
          </div>
        ` : ''}
      </aside>
    `;
  }

  renderToggleButtons() {
    return `
      <button class="sidebar-toggle left" data-action="toggle-left-sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${this.leftSidebarCollapsed ? '<path d="M9 18l6-6-6-6"/>' : '<path d="M15 18l-6-6 6-6"/>'}
        </svg>
      </button>

      <button class="sidebar-toggle right" data-action="toggle-right-sidebar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${this.rightSidebarCollapsed ? '<path d="M15 18l-6-6 6-6"/>' : '<path d="M9 18l6-6-6-6"/>'}
        </svg>
      </button>
    `;
  }

  attachEventListeners(container) {
    // Toggle sidebars
    container.querySelector('[data-action="toggle-left-sidebar"]')?.addEventListener('click', async () => {
      this.leftSidebarCollapsed = !this.leftSidebarCollapsed;
      await this.rerender(container);
    });

    container.querySelector('[data-action="toggle-right-sidebar"]')?.addEventListener('click', async () => {
      this.rightSidebarCollapsed = !this.rightSidebarCollapsed;
      await this.rerender(container);
    });

    // Navigation
    container.querySelector('[data-action="nav-home"]')?.addEventListener('click', () => {
      this.currentView = 'home';
      this.rerender(container);
    });

    container.querySelector('[data-action="nav-presentations"]')?.addEventListener('click', () => {
      this.currentView = 'presentations';
      this.rerender(container);
    });

    container.querySelector('[data-action="nav-sessions"]')?.addEventListener('click', () => {
      this.currentView = 'sessions';
      this.rerender(container);
    });

    // Actions
    container.querySelectorAll('[data-action="create-session"]').forEach(btn => {
      btn.addEventListener('click', () => this.createSession());
    });

    container.querySelectorAll('[data-action="create-presentation"]').forEach(btn => {
      btn.addEventListener('click', () => this.createPresentation());
    });

    container.querySelector('[data-action="end-session"]')?.addEventListener('click', () => {
      this.endSession();
    });

    container.querySelector('[data-action="open-session"]')?.addEventListener('click', () => {
      this.openSession();
    });

    container.querySelectorAll('[data-action="copy-code"]').forEach(btn => {
      btn.addEventListener('click', () => this.copySessionCode());
    });

    container.querySelector('[data-action="logout"]')?.addEventListener('click', () => {
      this.logout();
    });

    container.querySelector('[data-action="user-menu"]')?.addEventListener('click', () => {
      this.showUserMenu();
    });

    if (this.currentSession) {
        const qrCodeElement = document.getElementById('qrcode');
        if (qrCodeElement) {
            this.liveSessionManager.generateQRCode(qrCodeElement, this.currentSession.code);
        }
    }
  }

  subscribeToEvents() {
    // Actualizar cuando cambia la sesión
    this.eventBus.on('session:created', async () => {
      await this.loadInitialData();
      this.rerender(document.getElementById('app'));
    });

    this.eventBus.on('session:ended', async () => {
      await this.loadInitialData();
      this.rerender(document.getElementById('app'));
    });

    // Actualizar asistentes en tiempo real
    this.eventBus.on('session:joined', async () => {
      if (this.currentSession) {
        await this.loadAttendees();
        this.rerender(document.getElementById('app'));
      }
    });
  }

  async createSession() {
    this.eventBus.emit('modal:show', {
      type: 'create-session',
      title: 'Crear Nueva Sesión',
      callback: async (data) => {
        if (!data.title || data.title.trim().length < 3) {
          this.showNotification('error', 'El título debe tener al menos 3 caracteres');
          return;
        }

        try {
          const result = await this.sessionService.createSession({
            title: data.title.trim(),
            presenterId: this.currentUser.id
          });

          if (result.success) {
            this.showNotification('success', `Sesión creada: ${result.code}`);
            this.currentSession = result.session;
            await this.loadInitialData();
            this.rerender(document.getElementById('app'));
          } else {
            this.showNotification('error', result.error || 'Error al crear sesión');
          }
        } catch (error) {
          console.error('Error creating session:', error);
          this.showNotification('error', 'Error inesperado');
        }
      }
    });
  }

  async createPresentation() {
    this.eventBus.emit('modal:show', {
      type: 'create-presentation',
      title: 'Crear Nueva Presentación',
      callback: async (data) => {
        console.log('Creating presentation:', data);
        this.showNotification('info', 'Funcionalidad en desarrollo');
        // TODO: Implementar creación de presentación
      }
    });
  }

  async endSession() {
    if (!this.currentSession) return;

    if (!confirm('¿Estás seguro de finalizar la sesión?')) {
      return;
    }

    try {
      const result = await this.sessionService.endSession(this.currentSession.id);
      
      if (result.success) {
        this.showNotification('success', 'Sesión finalizada');
        this.currentSession = null;
        await this.loadInitialData();
        this.rerender(document.getElementById('app'));
      } else {
        this.showNotification('error', 'Error al finalizar sesión');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      this.showNotification('error', 'Error inesperado');
    }
  }

  openSession() {
    if (!this.currentSession) return;
    
    this.eventBus.emit('navigate', {
      view: 'presenter-session',
      data: { sessionId: this.currentSession.id }
    });
  }

  copySessionCode() {
    if (this.currentSession?.code) {
      navigator.clipboard.writeText(this.currentSession.code);
      this.showNotification('success', 'Código copiado');
    }
  }

  logout() {
    if (confirm('¿Seguro que quieres cerrar sesión?')) {
      this.authService.signOut();
      this.eventBus.emit('navigate', { view: 'landing' });
    }
  }

  showUserMenu() {
    this.showNotification('info', 'Menú de usuario en desarrollo');
    // TODO: Implementar menú de usuario
  }

  getStatusLabel(status) {
    const labels = {
      active: 'ACTIVA',
      paused: 'PAUSADA',
      ended: 'FINALIZADA'
    };
    return labels[status] || status.toUpperCase();
  }

  getAvatarInitials(name) {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  showNotification(type, message) {
    this.eventBus.emit('notification:show', { type, message });
  }

  async rerender(container) {
    const scrollPos = window.scrollY;
    await this.mount(container);
    window.scrollTo(0, scrollPos);
  }

  startPolling() {
    // Actualizar datos cada 30 segundos
    this.pollingInterval = setInterval(async () => {
      if (this.currentSession) {
        await this.loadAttendees();
        // Solo rerender el panel de asistentes
        const panel = document.querySelector('.spectator-list');
        if (panel) {
          panel.innerHTML = this.attendees.length > 0 
            ? this.dashboardRenderer.renderAttendees(this.attendees) 
            : this.dashboardRenderer.renderEmptyAttendees();
        }
      }
    }, 30000);
  }

  destroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }
}