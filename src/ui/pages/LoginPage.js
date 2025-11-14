export default class LoginPage {
  constructor(eventBus, authService) {
    this.eventBus = eventBus;
    this.authService = authService;
    this.loading = false;
    this.emailError = null;
    this.passwordError = null;
  }

  render() {
    return `
      <div class="auth-page">
        <div class="auth-card">
          <div class="auth-header">
            <h1 class="auth-title">${this.loading ? '🔐 Verificando...' : 'Iniciar Sesión'}</h1>
            <p class="auth-subtitle">Accede como presentador</p>
          </div>

          <form class="auth-form" id="login-form">
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                class="form-input ${this.emailError ? 'error' : ''}"
                placeholder="tu@email.com"
                required
                ${this.loading ? 'disabled' : ''}
              />
              ${this.emailError ? `<div class="form-error">${this.emailError}</div>` : ''}
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                class="form-input ${this.passwordError ? 'error' : ''}"
                placeholder="••••••••"
                required
                ${this.loading ? 'disabled' : ''}
              />
              ${this.passwordError ? `<div class="form-error">${this.passwordError}</div>` : ''}
            </div>

            <div class="auth-links">
              <a href="#" class="auth-link" data-action="create-account">
                Crear Cuenta
              </a>
              <a href="#" class="auth-link" data-action="forgot-password">
                Olvidé mi contraseña
              </a>
            </div>

            <button type="submit" class="btn btn-primary btn-lg w-full" ${this.loading ? 'disabled' : ''}>
              ${this.loading ? `
                <div style="display: inline-block; width: 16px; height: 16px; border: 2px solid transparent; border-top: 2px solid white; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 8px;"></div>
                Verificando...
              ` : 'INICIAR SESIÓN'}
            </button>
          </form>

          <div class="auth-divider">
            <span>o</span>
          </div>

          <button class="btn btn-outline w-full" data-action="go-spectator">
            Unirse como Espectador
          </button>
        </div>
      </div>
    `;
  }

  mount(container) {
    container.innerHTML = this.render();
    this.attachEventListeners(container);
  }

  attachEventListeners(container) {
    const form = container.querySelector('#login-form');
    let isSubmitting = false;
    
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;
      
      isSubmitting = true;
      await this.handleLogin(e.target);
      isSubmitting = false;
    });

    container.querySelector('[data-action="create-account"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.eventBus.emit('modal:show', {
        type: 'signup',
        title: 'Crear Cuenta',
        callback: async (data) => {
          if (!data.email || !data.password || !data.display_name) {
            this.showNotification('error', 'Por favor completa todos los campos');
            return;
          }
          try {
            const result = await this.authService.signUp({
              email: data.email,
              password: data.password,
              displayName: data.display_name
            });
            if (result.success) {
              this.showNotification('success', '¡Cuenta creada! Revisa tu email para confirmar.');
            } else {
              this.showNotification('error', result.error || 'Error al crear la cuenta');
            }
          } catch (error) {
            console.error('Error en signup:', error);
            this.showNotification('error', 'Error inesperado al crear la cuenta');
          }
        }
      });
    });

    container.querySelector('[data-action="forgot-password"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleForgotPassword();
    });

    container.querySelector('[data-action="go-spectator"]')?.addEventListener('click', () => {
      this.eventBus.emit('navigate', { view: 'join' });
    });
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'El email es requerido';
    if (!emailRegex.test(email)) return 'Email inválido';
    return null;
  }

  validatePassword(password) {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 6) return 'Mínimo 6 caracteres';
    return null;
  }

  async handleLogin(form) {
    const formData = new FormData(form);
    const email = formData.get('email')?.trim();
    const password = formData.get('password');

    this.emailError = null;
    this.passwordError = null;

    this.emailError = this.validateEmail(email);
    this.passwordError = this.validatePassword(password);

    if (this.emailError || this.passwordError) {
      this.rerender(document.getElementById('app'));
      return;
    }

    this.loading = true;
    this.rerender(document.getElementById('app'));

    try {
      const result = await this.authService.signIn({
        email: email,
        password: password
      });

      if (result.success) {
        this.showNotification('success', '¡Bienvenido Presentador!');
        
        // CORREGIDO: Redirigir siempre al dashboard
        setTimeout(() => {
          this.eventBus.emit('navigate', { view: 'dashboard' });
        }, 1000);
        
      } else {
        this.handleLoginError(result.error);
      }
    } catch (error) {
      console.error('Error en login:', error);
      this.showNotification('error', 'Error inesperado. Por favor intenta de nuevo.');
    } finally {
      this.loading = false;
      this.rerender(document.getElementById('app'));
    }
  }

  handleLoginError(error) {
    if (error.includes('Invalid login credentials')) {
      this.showNotification('error', 'Email o contraseña incorrectos');
    } else if (error.includes('Email not confirmed')) {
      this.showNotification('error', 'Confirma tu email antes de iniciar sesión');
    } else {
      this.showNotification('error', error || 'Error al iniciar sesión');
    }
  }

  async handleForgotPassword() {
    this.eventBus.emit('modal:show', {
      type: 'forgot-password',
      title: 'Restablecer Contraseña',
      callback: async (data) => {
        if (!data.email) {
          this.showNotification('error', 'Por favor ingresa un email');
          return;
        }
        try {
          const result = await this.authService.resetPassword(data.email);
          if (result.success) {
            this.showNotification('success', 'Email enviado. Revisa tu bandeja de entrada.');
          } else {
            this.showNotification('error', result.error || 'Error al enviar email');
          }
        } catch (error) {
          console.error('Error en reset password:', error);
          this.showNotification('error', 'Error inesperado');
        }
      }
    });
  }

  showNotification(type, message) {
    this.eventBus.emit('notification:show', {
      type,
      message,
      duration: 3000
    });
  }

  rerender(container) {
    const scrollPos = window.scrollY;
    this.mount(container);
    window.scrollTo(0, scrollPos);
  }

  destroy() {
    // Cleanup
  }
}