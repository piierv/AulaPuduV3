/**
 * AULAPUDU 2.0 - ROUTER
 * Sistema de navegación SPA
 */

class Router {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.routes = new Map();
    this.currentRoute = null;
    this.currentView = null;
    this.container = null;
  }

  /**
   * Inicializa el router
   */
  init(container) {
    this.container = container;
    
    // Escuchar eventos de navegación
    this.eventBus.on('navigate', (data) => {
      this.navigate(data.view, data.data);
    });

    // Manejar navegación del navegador
    window.addEventListener('popstate', () => {
      this.handlePopState();
    });

    console.log('🗺️ Router inicializado');
  }

  /**
   * Registra una ruta
   * @param {string} name - Nombre de la ruta
   * @param {Object} config - Configuración de la ruta
   */
  register(name, config) {
    this.routes.set(name, {
      component: config.component,
      requiresAuth: config.requiresAuth || false,
      roles: config.roles || [],
      path: config.path || `/${name}`
    });

    if (config.default) {
      this.defaultRoute = name;
    }
  }

  /**
   * Navega a una ruta
   * @param {string} routeName - Nombre de la ruta
   * @param {Object} data - Datos adicionales
   */
  async navigate(routeName, data = {}) {
    console.log(`Navigating to: ${routeName}`);
    const route = this.routes.get(routeName);
    console.log('Route:', route);
    console.log('Container:', this.container);

    if (!route) {
      console.error(`❌ Ruta '${routeName}' no encontrada`);
      return;
    }

    // Verificar autenticación si es requerida
    if (route.requiresAuth) {
      const isAuth = await this.checkAuth();
      if (!isAuth) {
        this.navigate('login');
        return;
      }

      // Verificar roles si es necesario
      if (route.roles.length > 0) {
        const hasRole = await this.checkRole(route.roles);
        if (!hasRole) {
          this.eventBus.emit('notification:show', {
            type: 'error',
            message: 'No tienes permisos para acceder a esta página'
          });
          return;
        }
      }
    }

    // Destruir vista actual si existe
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      this.currentView.destroy();
    }

    // Crear nueva vista
    this.currentRoute = routeName;
    this.currentView = route.component(data);

    // Montar vista
    if (this.container) {
      this.currentView.mount(this.container);
    }

    // Actualizar URL sin recargar
    const url = route.path + (data.params ? this.buildQueryString(data.params) : '');
    window.history.pushState({ route: routeName, data }, '', url);

    // Emitir evento
    this.eventBus.emit('view:change', {
      view: routeName,
      data
    });

    console.log(`🗺️ Navegado a: ${routeName}`);
  }

  /**
   * Maneja el evento popstate (botón atrás/adelante)
   */
  handlePopState() {
    const state = window.history.state;
    
    if (state && state.route) {
      this.navigate(state.route, state.data || {});
    } else if (this.defaultRoute) {
      this.navigate(this.defaultRoute);
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  async checkAuth() {
    return new Promise((resolve) => {
      this.eventBus.emit('auth:check', {
        callback: (isAuth) => resolve(isAuth)
      });
    });
  }

  /**
   * Verifica si el usuario tiene el rol requerido
   */
  async checkRole(roles) {
    return new Promise((resolve) => {
      this.eventBus.emit('auth:checkRole', {
        roles,
        callback: (hasRole) => resolve(hasRole)
      });
    });
  }

  /**
   * Construye query string desde objeto
   */
  buildQueryString(params) {
    const query = new URLSearchParams(params).toString();
    return query ? `?${query}` : '';
  }

  /**
   * Obtiene la ruta actual
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * Retrocede en el historial
   */
  back() {
    window.history.back();
  }

  /**
   * Avanza en el historial
   */
  forward() {
    window.history.forward();
  }
}

export default Router;