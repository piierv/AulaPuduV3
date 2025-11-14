/**
 * AULAPUDU 2.0 - SPECTATOR PAGE
 * Vista para espectadores (mobile-first)
 * Basado en espectator.png
 */

export default class SpectatorPage {
  constructor(eventBus, realtimeService, data) {
    this.eventBus = eventBus;
    this.realtimeService = realtimeService;
    this.data = data;
    this.sessionId = data.sessionId;
    this.sessionCode = data.sessionCode;
    this.spectatorName = data.spectatorName;
    this.currentSlide = 0;
    this.contentType = 'pdf'; // pdf, image, text, html
    this.reactions = {
      thumbs_up: false,
      heart: false,
      surprised: false,
      question: false
    };
    this.activeTab = null; // null, 'reactions', 'polls', 'quiz'
  }

  render() {
    return `
      <div class="spectator-view">
        ${this.renderHeader()}
        ${this.renderContent()}
        ${this.renderMobileBar()}
        ${this.activeTab ? this.renderActivePanel() : ''}
      </div>
    `;
  }

  renderHeader() {
    return `
      <div class="spectator-header">
        <button class="btn-icon" data-action="exit-session">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div class="spectator-session-info">
          <span class="session-code">${this.sessionCode}</span>
          <span class="spectator-separator">•</span>
          <span class="spectator-name">${this.spectatorName}</span>
        </div>
        <button class="btn-icon" data-action="session-info">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </button>
      </div>
    `;
  }

  renderContent() {
    return `
      <div class="spectator-content">
        <div class="spectator-card">
          ${this.renderSlideContent()}
        </div>

        <!-- Slide navigation (if applicable) -->
        ${this.renderSlideNavigation()}
      </div>
    `;
  }

  renderSlideContent() {
    // Contenido de demostración basado en espectator.png
    return `
      <div class="spectator-content-area">
        ${this.renderMathContent()}
      </div>
    `;
  }

  renderMathContent() {
    // Recreando el contenido matemático visual de espectator.png
    return `
      <div class="math-content-grid">
        <!-- Gráfico principal superior izquierdo -->
        <div class="math-item large">
          <svg viewBox="0 0 300 250" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style="stop-color:#f4a582;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#f5cf66;stop-opacity:1" />
              </linearGradient>
            </defs>
            <!-- Grid -->
            <g stroke="#e5e7eb" stroke-width="0.5">
              ${Array.from({length: 12}, (_, i) => `<line x1="${25 + i * 25}" y1="25" x2="${25 + i * 25}" y2="225"/>`).join('')}
              ${Array.from({length: 9}, (_, i) => `<line x1="25" y1="${25 + i * 25}" x2="300" y2="${25 + i * 25}"/>`).join('')}
            </g>
            <!-- Ejes -->
            <line x1="150" y1="25" x2="150" y2="225" stroke="#2d2d2d" stroke-width="2"/>
            <line x1="25" y1="125" x2="300" y2="125" stroke="#2d2d2d" stroke-width="2"/>
            <!-- Círculo naranja -->
            <circle cx="150" cy="125" r="60" fill="url(#orangeGrad)" opacity="0.8"/>
            <!-- Parábola -->
            <path d="M 75 200 Q 150 50 225 200" fill="none" stroke="#88c1b2" stroke-width="3"/>
            <!-- Puntos -->
            <circle cx="100" cy="100" r="4" fill="#f4a582"/>
            <circle cx="200" cy="100" r="4" fill="#88c1b2"/>
            <circle cx="150" cy="65" r="4" fill="#2d2d2d"/>
          </svg>
        </div>

        <!-- Fórmulas lado derecho superior -->
        <div class="math-formulas">
          <div class="formula-item">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <mrow>
                <mi>S</mi>
                <mo>(</mo>
                <mi>x</mi>
                <mo>+</mo>
                <mi>f</mi>
                <mi>x</mi>
                <mo>(</mo>
                <mi>a</mi>
                <mo>)</mo>
                <mo>)</mo>
                <mo>=</mo>
                <mover><mi>g</mi><mo>^</mo></mover>
                <mi>x</mi>
              </mrow>
            </math>
          </div>
          <div class="formula-item">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <mrow>
                <mi>x</mi>
                <mo>=</mo>
                <mfrac>
                  <mn>1</mn>
                  <mi>B</mi>
                </mfrac>
                <mo>+</mo>
                <mfrac>
                  <mn>1</mn>
                  <mi>A</mi>
                </mfrac>
              </mrow>
            </math>
          </div>
          <div class="formula-item">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <mrow>
                <mfrac>
                  <mi>E</mi>
                  <mi>B</mi>
                </mfrac>
                <mo>=</mo>
                <mfrac>
                  <mrow>
                    <mi>R</mi>
                    <mo>(</mo>
                    <msup><mi>x</mi><mn>2</mn></msup>
                    <mo>)</mo>
                  </mrow>
                  <mrow>
                    <mi>d</mi>
                    <mo>+</mo>
                    <mi>B</mi>
                  </mrow>
                </mfrac>
              </mrow>
            </math>
          </div>
        </div>

        <!-- Íconos pequeños lado derecho -->
        <div class="mini-icons">
          <div class="mini-icon" style="background: #f5cf66; border-radius: 8px; padding: 8px;">
            <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="25" fill="none" stroke="#2d2d2d" stroke-width="2"/>
              <path d="M 20 30 L 30 40 L 40 20" fill="none" stroke="#2d2d2d" stroke-width="2"/>
            </svg>
          </div>
          <div class="mini-icon" style="background: #88c1b2; border-radius: 8px; padding: 8px;">
            <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="40" height="40" fill="none" stroke="#fff" stroke-width="2"/>
              <line x1="20" y1="20" x2="40" y2="40" stroke="#fff" stroke-width="2"/>
            </svg>
          </div>
        </div>

        <!-- Más gráficos abajo -->
        <div class="math-item">
          <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
            <path d="M 10 100 L 50 20 L 90 80 L 130 30 L 170 90" fill="none" stroke="#88c1b2" stroke-width="2"/>
            <path d="M 10 80 Q 90 20 170 70" fill="none" stroke="#f5cf66" stroke-width="2"/>
          </svg>
        </div>

        <div class="math-item">
          <svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="60" r="40" fill="none" stroke="#88c1b2" stroke-width="2"/>
            <circle cx="100" cy="60" r="50" fill="none" stroke="#f4a582" stroke-width="2"/>
          </svg>
        </div>

        <!-- Gráfico de pastel -->
        <div class="math-item">
          <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="50" fill="#88c1b2"/>
            <path d="M 60 60 L 60 10 A 50 50 0 0 1 95 85 Z" fill="#f5cf66"/>
            <path d="M 60 60 L 95 85 A 50 50 0 0 1 10 60 Z" fill="#f4a582"/>
          </svg>
        </div>

        <!-- Más fórmulas -->
        <div class="math-formulas">
          <div class="formula-item">T = 2x) + (x) = √(3/2)</div>
          <div class="formula-item">F²2 = √((4+11)/(3+2))</div>
          <div class="formula-item">(Ax + ℓ + x(4))/(NN + (S))</div>
        </div>
      </div>
    `;
  }

  renderSlideNavigation() {
    return `
      <div class="slide-navigation">
        <button class="btn-icon" data-action="prev-slide" ${this.currentSlide === 0 ? 'disabled' : ''}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <span class="slide-counter">Slide ${this.currentSlide + 1}</span>
        <button class="btn-icon" data-action="next-slide">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    `;
  }

  renderMobileBar() {
    return `
      <div class="mobile-bar">
        <button class="mobile-bar-item ${this.activeTab === 'reactions' ? 'active' : ''}" 
                data-action="toggle-reactions">
          <svg class="mobile-bar-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
          </svg>
          <span class="mobile-bar-label">Reactions</span>
        </button>

        <button class="mobile-bar-item ${this.activeTab === 'polls' ? 'active' : ''}" 
                data-action="toggle-polls">
          <svg class="mobile-bar-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="20" x2="12" y2="10"></line>
            <line x1="18" y1="20" x2="18" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="16"></line>
          </svg>
          <span class="mobile-bar-label">Polls</span>
        </button>

        <button class="mobile-bar-item ${this.activeTab === 'quiz' ? 'active' : ''}" 
                data-action="toggle-quiz">
          <svg class="mobile-bar-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
          </svg>
          <span class="mobile-bar-label">Quiz</span>
        </button>
      </div>
    `;
}

  renderActivePanel() {
    const panels = {
      reactions: this.renderReactionsPanel(),
      polls: this.renderPollsPanel(),
      quiz: this.renderQuizPanel()
    };

    return `
      <div class="active-panel animate-slide-in-up">
        <div class="panel-backdrop" data-action="close-panel"></div>
        <div class="panel-content">
          <div class="panel-header">
            <h3>${this.activeTab.charAt(0).toUpperCase() + this.activeTab.slice(1)}</h3>
            <button class="btn-icon" data-action="close-panel">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="panel-body">
            ${panels[this.activeTab]}
          </div>
        </div>
      </div>
    `;
  }

  renderReactionsPanel() {
    const reactions = [
      { type: 'thumbs_up', emoji: '👍', label: 'Me gusta', active: this.reactions.thumbs_up },
      { type: 'heart', emoji: '❤️', label: 'Me encanta', active: this.reactions.heart },
      { type: 'surprised', emoji: '😮', label: 'Sorprendido', active: this.reactions.surprised },
      { type: 'question', emoji: '❓', label: 'Pregunta', active: this.reactions.question }
    ];

    return `
      <div class="reactions-grid">
        ${reactions.map(reaction => `
          <button class="reaction-button ${reaction.active ? 'active' : ''}" 
                  data-action="send-reaction" 
                  data-type="${reaction.type}">
            <span class="reaction-emoji">${reaction.emoji}</span>
            <span class="reaction-label">${reaction.label}</span>
          </button>
        `).join('')}
      </div>
      <p class="panel-hint">Puedes enviar una reacción de cada tipo por sesión</p>
    `;
  }

  renderPollsPanel() {
    // Ejemplo de poll activo
    return `
      <div class="poll-container">
        <h4 class="poll-question">¿Entendiste el concepto de límites?</h4>
        <div class="poll-options">
          <button class="poll-option" data-action="vote-poll" data-option="0">
            <span class="poll-option-text">Sí, perfectamente</span>
            <span class="poll-option-percentage">45%</span>
          </button>
          <button class="poll-option" data-action="vote-poll" data-option="1">
            <span class="poll-option-text">Más o menos</span>
            <span class="poll-option-percentage">35%</span>
          </button>
          <button class="poll-option" data-action="vote-poll" data-option="2">
            <span class="poll-option-text">No mucho</span>
            <span class="poll-option-percentage">15%</span>
          </button>
          <button class="poll-option" data-action="vote-poll" data-option="3">
            <span class="poll-option-text">No lo entendí</span>
            <span class="poll-option-percentage">5%</span>
          </button>
        </div>
        <div class="poll-footer">
          <span class="text-secondary">42 respuestas</span>
        </div>
      </div>
    `;
  }

  renderQuizPanel() {
    // Ejemplo de pregunta de quiz
    return `
      <div class="quiz-container">
        <div class="quiz-progress">
          <div class="quiz-progress-bar" style="width: 33.33%"></div>
        </div>
        <div class="quiz-header">
          <span class="quiz-number">Pregunta 1 de 3</span>
          <span class="quiz-timer">⏱️ 0:45</span>
        </div>
        
        <h4 class="quiz-question">¿Cuál es el resultado de la integral ∫x²dx?</h4>
        
        <div class="quiz-options">
          <button class="quiz-option" data-action="answer-quiz" data-answer="A">
            <span class="quiz-option-letter">A</span>
            <span class="quiz-option-text">x³/3 + C</span>
          </button>
          <button class="quiz-option" data-action="answer-quiz" data-answer="B">
            <span class="quiz-option-letter">B</span>
            <span class="quiz-option-text">2x + C</span>
          </button>
          <button class="quiz-option" data-action="answer-quiz" data-answer="C">
            <span class="quiz-option-letter">C</span>
            <span class="quiz-option-text">x² + C</span>
          </button>
          <button class="quiz-option" data-action="answer-quiz" data-answer="D">
            <span class="quiz-option-letter">D</span>
            <span class="quiz-option-text">x³ + C</span>
          </button>
        </div>

        <button class="btn btn-primary btn-lg w-full" style="margin-top: 24px;" disabled>
          Confirmar Respuesta
        </button>
      </div>
    `;
  }

  mount(container) {
    container.innerHTML = this.render();
    this.attachEventListeners(container);
    this.setupRealtimeSync();
  }

  attachEventListeners(container) {
    // Exit session
    container.querySelector('[data-action="exit-session"]')?.addEventListener('click', () => {
      this.exitSession();
    });

    // Mobile bar tabs
    container.querySelector('[data-action="toggle-reactions"]')?.addEventListener('click', () => {
      this.togglePanel('reactions');
    });

    container.querySelector('[data-action="toggle-polls"]')?.addEventListener('click', () => {
      this.togglePanel('polls');
    });

    container.querySelector('[data-action="toggle-quiz"]')?.addEventListener('click', () => {
      this.togglePanel('quiz');
    });

    // Close panel
    container.querySelectorAll('[data-action="close-panel"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closePanel();
        this.rerender(container);
      });
    });

    // Send reactions
    container.querySelectorAll('[data-action="send-reaction"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        this.sendReaction(type);
      });
    });

    // Slide navigation
    container.querySelector('[data-action="prev-slide"]')?.addEventListener('click', () => {
      this.prevSlide();
    });

    container.querySelector('[data-action="next-slide"]')?.addEventListener('click', () => {
      this.nextSlide();
    });
  }

  togglePanel(panelName) {
    if (this.activeTab === panelName) {
      this.activeTab = null;
    } else {
      this.activeTab = panelName;
    }
    this.rerender(document.getElementById('app'));
  }

  closePanel() {
    this.activeTab = null;
  }

  async sendReaction(type) {
    if (this.reactions[type]) {
      this.showNotification('info', 'Ya enviaste esta reacción');
      return;
    }

    // TODO: Enviar reacción via ReactionService
    this.reactions[type] = true;
    this.showNotification('success', '¡Reacción enviada!');
    this.rerender(document.getElementById('app'));
  }

  setupRealtimeSync() {
    this.realtimeService.joinChannel(this.sessionId);

    this.eventBus.on('session:slideChanged', (data) => {
      this.currentSlide = data.slideNumber;
      this.rerender(document.getElementById('app'));
    });

    this.eventBus.on('session:ended', () => {
      this.showNotification('info', 'La sesión ha finalizado.');
      this.eventBus.emit('navigate', { view: 'landing' });
    });

    this.eventBus.on('attendee:kicked', (data) => {
      // Assuming the data contains the attendeeId
      // We need to get the current attendee id and compare.
      // For now, let's assume we don't have it, so we just notify.
      this.showNotification('warning', 'Has sido expulsado de la sesión.');
      this.eventBus.emit('navigate', { view: 'landing' });
    });
  }

  exitSession() {
    if (confirm('¿Seguro que quieres salir de la sesión?')) {
      this.eventBus.emit('navigate', { view: 'landing' });
    }
  }

  prevSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.rerender(document.getElementById('app'));
    }
  }

  nextSlide() {
    this.currentSlide++;
    this.rerender(document.getElementById('app'));
  }

  showNotification(type, message) {
    this.eventBus.emit('notification:show', { type, message });
  }

  rerender(container) {
    const scrollPos = window.scrollY;
    this.mount(container);
    window.scrollTo(0, scrollPos);
  }

  destroy() {
    this.realtimeService.leaveChannel();
  }
}