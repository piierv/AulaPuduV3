/**
 * AULAPUDU 2.0 - PRESENTER SESSION PAGE
 * Vista del presentador durante una sesión en vivo
 */

/**
 * AULAPUDU 2.0 - PRESENTER SESSION PAGE
 * Vista del presentador durante una sesión en vivo
 */

export default class PresenterSessionPage {
  constructor(eventBus, sessionService, authService, realtimeService, data) {
    this.eventBus = eventBus;
    this.sessionService = sessionService;
    this.authService = authService;
    this.realtimeService = realtimeService;
    this.data = data;
    this.currentSession = null;
  }

  async mount(container) {
    if (this.data && this.data.sessionId) {
      const result = await this.sessionService.getSession(this.data.sessionId);
      if (result.success) {
        this.currentSession = result.session;
        this.realtimeService.joinChannel(this.currentSession.id);
      }
    }
    container.innerHTML = this.render();
    this.attachEventListeners(container);
  }

  render() {
    if (!this.currentSession) {
      return `
        <div class="presenter-session-page">
          <h1>No se ha encontrado la sesión</h1>
          <p>Por favor, vuelve al dashboard y selecciona una sesión.</p>
        </div>
      `;
    }

    return `
      <div class="presenter-session-page">
        <div class="presenter-session-header">
          <h1>${this.currentSession.title}</h1>
          <div class="session-code">Código: ${this.currentSession.code}</div>
        </div>
        <div class="presenter-session-content">
          <div class="presenter-preview">
            <h2>Previsualización</h2>
            <div class="preview-area">
              <p>Aquí se mostrará la previsualización de la diapositiva.</p>
            </div>
          </div>
          <div class="presenter-controls">
            <h2>Controles</h2>
            <div class="control-group">
              <h3>Código de Sesión y QR</h3>
              <canvas id="qr-code-canvas"></canvas>
            </div>
            <div class="control-group">
              <h3>Reacciones</h3>
              <div class="reactions-display">
                <div class="reaction-item">👍 <span>12</span></div>
                <div class="reaction-item">❤️ <span>8</span></div>
                <div class="reaction-item">😮 <span>3</span></div>
                <div class="reaction-item">❓ <span>1</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners(container) {
    if (this.currentSession) {
      const canvas = container.querySelector('#qr-code-canvas');
      if (canvas) {
        const joinUrl = `${window.location.origin}/join?code=${this.currentSession.code}`;
        QRCode.toCanvas(canvas, joinUrl, { width: 200 }, (error) => {
          if (error) console.error(error);
        });
      }
    }
  }

  destroy() {
    this.realtimeService.leaveChannel();
  }
}
