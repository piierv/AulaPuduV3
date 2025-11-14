/**
 * AULAPUDU 2.0 - MODAL COMPONENT
 * Componente reutilizable para modales
 */

export default class Modal {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.container = document.getElementById('modal-root');
    this.active = false;
    this.data = null;

    this.eventBus.on('modal:show', (data) => {
      this.show(data);
    });

    this.eventBus.on('modal:hide', () => {
      this.hide();
    });
  }

  show(data) {
    this.data = data;
    this.active = true;
    this.render();
  }

  hide() {
    this.active = false;
    this.container.innerHTML = '';
  }

  render() {
    if (!this.active) {
      this.container.innerHTML = '';
      return;
    }

    const modalContent = this.getModalContent();

    this.container.innerHTML = `
      <div class="modal-backdrop active">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">${this.data.title}</h3>
            <button class="modal-close" data-action="close-modal">✕</button>
          </div>
          <div class="modal-body">
            ${modalContent}
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  getModalContent() {
    switch (this.data.type) {
      case 'signup':
        return this.renderSignupForm();
      case 'forgot-password':
        return this.renderForgotPasswordForm();
      case 'create-session':
        return this.renderCreateSessionForm();
      case 'create-presentation':
        return this.renderCreatePresentationForm();
      case 'custom':
        return this.data.content;
      default:
        return `<p>Tipo de modal no reconocido: ${this.data.type}</p>`;
    }
  }

  renderSignupForm() {
    return `
      <form id="signup-form" class="auth-form">
        <div class="form-group">
          <label class="form-label" for="display_name">Nombre</label>
          <input type="text" id="display_name" name="display_name" class="form-input" placeholder="Tu Nombre" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input type="email" id="email" name="email" class="form-input" placeholder="tu@email.com" required>
        </div>
        <div class="form-group">
          <label class="form-label" for="password">Contraseña</label>
          <input type="password" id="password" name="password" class="form-input" placeholder="••••••••" required>
        </div>
        <button type="submit" class="btn btn-primary btn-lg w-full">Crear Cuenta</button>
      </form>
    `;
  }

  renderForgotPasswordForm() {
    return `
      <form id="forgot-password-form" class="auth-form">
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input type="email" id="email" name="email" class="form-input" placeholder="tu@email.com" required>
        </div>
        <button type="submit" class="btn btn-primary btn-lg w-full">Enviar Email</button>
      </form>
    `;
  }

  renderCreateSessionForm() {
    return `
      <form id="create-session-form" class="auth-form">
        <div class="form-group">
          <label class="form-label" for="title">Título de la Sesión</label>
          <input type="text" id="title" name="title" class="form-input" placeholder="Ej: Clase de Cálculo" required>
        </div>
        <button type="submit" class="btn btn-primary btn-lg w-full">Crear Sesión</button>
      </form>
    `;
  }

    renderCreatePresentationForm() {
    return `
        <form id="create-presentation-form" class="auth-form">
            <div class="form-group">
                <label class="form-label" for="title">Título de la Presentación</label>
                <input type="text" id="title" name="title" class="form-input" placeholder="Ej: Introducción a la Física" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="description">Descripción</label>
                <textarea id="description" name="description" class="form-textarea" placeholder="Una breve descripción de la presentación"></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-lg w-full">Crear Presentación</button>
        </form>
    `;
    }

  attachEventListeners() {
    const closeModalButton = this.container.querySelector('[data-action="close-modal"]');
    closeModalButton?.addEventListener('click', () => {
      this.hide();
    });

    const backdrop = this.container.querySelector('.modal-backdrop');
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.hide();
      }
    });

    const form = this.container.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        this.data.callback(data);
        this.hide();
      });
    } else if (this.data.type === 'custom' && this.data.callback) {
      this.data.callback();
    }
  }
}
