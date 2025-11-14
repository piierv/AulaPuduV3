/**
 * AULAPUDU 2.0 - JOIN PAGE
 * Página para unirse a una sesión con código
 */

import coreEngine from '../../core/CoreEngine.js';

export default class JoinPage {
  constructor(eventBus, sessionService) {
    this.eventBus = eventBus;
    this.sessionService = sessionService;
    this.loading = false;
  }

  render() {
    // Corregido: El botón "Soy Presentador" debe tener el estilo btn-outline para coincidir con la imagen.
    return `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">ÚNETE A LA SESIÓN</h1>
            <p class="auth-subtitle">Ingresa tus datos para participar</p>
          </div>

          <form class="auth-form" id="join-form">
            <div class="form-group">
              <label class="form-label" for="name">Tu Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                class="form-input"
                placeholder="Tu Nombre"
                required
                autocomplete="name"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="session-code">Código de Sesión</label>
              <input
                type="text"
                id="session-code"
                name="session-code"
                class="form-input"
                placeholder="Código de Sesión"
                required
                maxlength="8"
                style="text-transform: uppercase; letter-spacing: 2px; text-align: center; font-size: 1.5rem; font-weight: bold;"
              />
              <small style="display: block; margin-top: 8px; color: var(--text-secondary); font-size: 0.875rem;">
                Ingresa el código de 6-8 caracteres proporcionado por el presentador
              </small>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-full" ${this.loading ? 'disabled' : ''}>
              ${this.loading ? 'Conectando...' : 'UNIRSE A LA SESIÓN'}
            </button>
          </form>

          <div class="auth-divider">
            <span>o</span>
          </div>

          <button class="btn btn-outline w-full" data-action="go-presenter">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
              <path d="M5 3l14 9-14 9V3z"></path>
            </svg>
            Soy Presentador
          </button>

          <div style="text-align: center; margin-top: 16px;">
            <a href="#" class="auth-link" data-action="go-home">
              ← Volver al inicio
            </a>
          </div>
        </div>
      </div>
    `;
  }

  mount(container) {
    container.innerHTML = this.render();
    this.attachEventListeners(container);
    
    // Auto-focus en el campo de nombre
    setTimeout(() => {
      container.querySelector('#name')?.focus();
    }, 100);

    // Pre-fill session code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      const codeInput = container.querySelector('#session-code');
      if (codeInput) {
        codeInput.value = code;
      }
    }
  }

  attachEventListeners(container) {
    // Form submit
    const form = container.querySelector('#join-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleJoin(e.target);
    });

    // Session code auto-uppercase
    const codeInput = container.querySelector('#session-code');
    codeInput?.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });

    // Go presenter button
    container.querySelector('[data-action="go-presenter"]')?.addEventListener('click', () => {
      this.eventBus.emit('navigate', { view: 'login' });
    });

    // Go home link
    container.querySelector('[data-action="go-home"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.eventBus.emit('navigate', { view: 'landing' });
    });
  }

  async handleJoin(form) {
    const formData = new FormData(form);
    const name = formData.get('name')?.trim();
    const sessionCode = formData.get('session-code')?.trim().toUpperCase();

    // Validaciones
    if (!name || name.length < 2) {
      this.showNotification('error', 'Por favor ingresa un nombre válido (mínimo 2 caracteres)');
      return;
    }

    if (!sessionCode || sessionCode.length < 6) {
      this.showNotification('error', 'El código de sesión debe tener al menos 6 caracteres');
      return;
    }

    this.loading = true;
    this.updateLoadingState();

    try {
      // Intentar unirse a la sesión
      const result = await this.sessionService.joinSession(sessionCode, name);

      if (result.success) {
        this.showNotification('success', `¡Bienvenido ${name}! Conectando a la sesión...`);
        
        // Guardar datos del espectador en localStorage
        localStorage.setItem('aulapudu:spectator', JSON.stringify({
          name,
          sessionCode,
          joinedAt: Date.now()
        }));

        // Navegar a vista de espectador
        setTimeout(() => {
          this.eventBus.emit('navigate', {
            view: 'spectator',
            data: {
              sessionCode,
              spectatorName: name,
              sessionId: result.sessionId
            }
          });
        }, 1000);
      } else {
        // Manejar diferentes tipos de errores
        if (result.error === 'SESSION_NOT_FOUND') {
          this.showNotification('error', 'Sesión no encontrada. Verifica el código e intenta de nuevo.');
        } else if (result.error === 'SESSION_FULL') {
          this.showNotification('error', 'Esta sesión ha alcanzado el límite de participantes.');
        } else if (result.error === 'SESSION_ENDED') {
          this.showNotification('error', 'Esta sesión ha finalizado.');
        } else {
          this.showNotification('error', result.error || 'Error al unirse a la sesión');
        }
      }
    } catch (error) {
      console.error('Error en join:', error);
      this.showNotification('error', 'Error inesperado. Por favor intenta de nuevo.');
    } finally {
      this.loading = false;
      this.updateLoadingState();
    }
  }

  updateLoadingState() {
    const submitBtn = document.querySelector('#join-form button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = this.loading;
      submitBtn.textContent = this.loading ? 'Conectando...' : 'UNIRSE A LA SESIÓN';
    }
  }

  showNotification(type, message) {
    this.eventBus.emit('notification:show', {
      type,
      message,
      duration: 4000
    });
  }

  destroy() {
    // Cleanup si es necesario
  }
}