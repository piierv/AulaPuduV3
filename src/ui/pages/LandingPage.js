/**
 * AULAPUDU 2.0 - LANDING PAGE
 * Página de inicio con hero section y CTAs
 */

export default class LandingPage {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  render() {
    return `
      <div class="landing-page">
        <!-- Header -->
        <header class="landing-header">
          <div class="landing-logo">AULAPUDU 2.0</div>
          <nav class="landing-nav">
            <a href="#quienes-somos" class="landing-nav-link">QUIÉNES SOMOS</a>
            <a href="#contactanos" class="landing-nav-link">CONTÁCTANOS</a>
          </nav>
        </header>

        <!-- Hero Section -->
        <section class="landing-hero">
          <div class="landing-hero-content">
            <h1 class="landing-hero-title">
              EDUCACIÓN MODULAR.<br>
              INTERACCIÓN EN VIVO
            </h1>
            <p class="landing-hero-subtitle">
              La plataforma extensible para el futuro del aprenizaje
              con módulos 3D y AR/VR
            </p>
            <div class="landing-hero-actions">
              <button class="btn btn-accent btn-lg" data-action="go-spectator">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4M12 8h.01"></path>
                </svg>
                SOY ESPECTADOR
              </button>
              <button class="btn btn-primary btn-lg" data-action="go-presenter">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 3l14 9-14 9V3z"></path>
                </svg>
                SOY PRESENTADOR
              </button>
            </div>
          </div>

          <!-- 3D Visual -->
          <div class="landing-hero-visual">
            <div class="cubes-3d">
              ${this.render3DCubes()}
            </div>
          </div>
        </section>

        <!-- Join with Code (Bottom Right) -->
        <div class="landing-join-code" data-action="join-code">
          <span>Únete con Código</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
    `;
  }

  render3DCubes() {
    return `
      <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <!-- Definiciones de gradientes -->
        <defs>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#88c1b2;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#6ba896;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f5cf66;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#f0be42;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="salmonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f4a582;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ee8d64;stop-opacity:1" />
          </linearGradient>
        </defs>

        <!-- Cubos interconectados -->
        <g transform="translate(200, 200)">
          <!-- Cubo grande central (Verde) -->
          <g class="cube-1" style="animation: float 3s ease-in-out infinite;">
            <rect x="-40" y="-40" width="80" height="80" fill="url(#greenGrad)" rx="8" opacity="0.9"/>
            <rect x="-35" y="-35" width="70" height="70" fill="none" stroke="#fff" stroke-width="2" rx="6" opacity="0.3"/>
          </g>

          <!-- Cubo mediano (Naranja) -->
          <g class="cube-2" style="animation: float 3s ease-in-out 0.5s infinite;">
            <rect x="40" y="-80" width="60" height="60" fill="url(#orangeGrad)" rx="6" opacity="0.9"/>
            <line x1="0" y1="-40" x2="70" y2="-50" stroke="#88c1b2" stroke-width="2" opacity="0.4"/>
          </g>

          <!-- Cubo pequeño (Salmón) -->
          <g class="cube-3" style="animation: float 3s ease-in-out 1s infinite;">
            <rect x="-100" y="40" width="45" height="45" fill="url(#salmonGrad)" rx="4" opacity="0.9"/>
            <line x1="-40" y1="40" x2="-77" y2="62" stroke="#88c1b2" stroke-width="2" opacity="0.4"/>
          </g>

          <!-- Cubo adicional (Verde claro) -->
          <g class="cube-4" style="animation: float 3s ease-in-out 1.5s infinite;">
            <rect x="60" y="50" width="50" height="50" fill="url(#greenGrad)" rx="5" opacity="0.7"/>
            <line x1="40" y1="40" x2="60" y2="75" stroke="#f5cf66" stroke-width="2" opacity="0.4"/>
          </g>

          <!-- Nodos conectores -->
          <circle cx="0" cy="0" r="6" fill="#88c1b2" opacity="0.6"/>
          <circle cx="70" cy="-50" r="5" fill="#f5cf66" opacity="0.6"/>
          <circle cx="-77" cy="62" r="5" fill="#f4a582" opacity="0.6"/>
          <circle cx="85" cy="75" r="5" fill="#88c1b2" opacity="0.6"/>
        </g>

        <!-- Elementos decorativos flotantes -->
        <circle cx="80" cy="80" r="3" fill="#88c1b2" opacity="0.3">
          <animate attributeName="cy" values="80;60;80" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="320" cy="100" r="4" fill="#f5cf66" opacity="0.3">
          <animate attributeName="cy" values="100;80;100" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="100" cy="320" r="3" fill="#f4a582" opacity="0.3">
          <animate attributeName="cy" values="320;300;320" dur="3s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
  }

  mount(container) {
    container.innerHTML = this.render();
    this.attachEventListeners(container);
  }

  attachEventListeners(container) {
    // Botón Espectador
    container.querySelector('[data-action="go-spectator"]')?.addEventListener('click', () => {
      this.eventBus.emit('navigate', { view: 'join' });
    });

    // Botón Presentador
    container.querySelector('[data-action="go-presenter"]')?.addEventListener('click', () => {
      this.eventBus.emit('navigate', { view: 'login' });
    });

    // Únete con Código
    container.querySelector('[data-action="join-code"]')?.addEventListener('click', () => {
      this.eventBus.emit('navigate', { view: 'join' });
    });

    // Links de navegación
    container.querySelectorAll('.landing-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        // Aquí puedes implementar scroll suave a secciones
        console.log('Navigate to:', link.getAttribute('href'));
      });
    });
  }

  destroy() {
    // Cleanup si es necesario
  }
}