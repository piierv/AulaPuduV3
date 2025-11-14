/**
 * AULAPUDU 2.0 - CORE ENGINE (REFACTORIZADO)
 * Motor principal con Dependency Injection
 */

import EventBus from './EventBus.js';
import Logger from './Logger.js';
import DIContainer from './DIContainer.js';

export class CoreEngine {
  #state = {
    initialized: false,
    user: null,
    currentView: null,
    currentSession: null,
    config: {}
  };
  
  #container = null;
  #eventBus = null;
  #logger = null;

  constructor(config = {}) {
    this.#state.config = {
      ...this.#getDefaultConfig(),
      ...config
    };

    // Inicializar logger
    this.#logger = new Logger({
      level: this.#state.config.debug ? 'debug' : 'info',
      context: 'CoreEngine'
    });

    // Inicializar EventBus
    this.#eventBus = new EventBus(this.#logger);

    // Inicializar DI Container
    this.#container = new DIContainer();
    
    this.#setupContainer();
  }

  get eventBus() {
    return this.#eventBus;
  }

  get logger() {
    return this.#logger;
  }

  get container() {
    return this.#container;
  }

  #getDefaultConfig() {
    return {
      debug: true,
      autoSaveState: true,
      persistState: true,
      realtimeEnabled: true
    };
  }

  #setupContainer() {
    // Registrar servicios core
    this.#container.register('eventBus', () => this.#eventBus, { singleton: true });
    this.#container.register('logger', () => this.#logger, { singleton: true });
    this.#container.register('config', () => this.#state.config, { singleton: true });
  }

  async initialize() {
    this.#logger.info('Initializing AulaPudu Core Engine...');
    
    try {
      // Cargar estado persistido
      this.#loadPersistedState();

      // Inicializar EventBus
      this.#eventBus.initialize({ debug: this.#state.config.debug });
      
      // Registrar eventos core
      this.#registerCoreEvents();
      
      this.#state.initialized = true;
      this.#eventBus.emit('core:initialized', { timestamp: Date.now() });
      
      this.#logger.info('Core Engine initialized successfully');
      return true;
    } catch (error) {
      this.#logger.error('Failed to initialize Core Engine', error);
      this.#eventBus.emit('core:error', { error });
      throw error;
    }
  }

  #registerCoreEvents() {
    // Estado del usuario
    this.#eventBus.on('user:login', (data) => {
      this.#state.user = data.user;
      this.#saveState();
      this.#logger.info('User logged in', { email: data.user.email });
    });

    this.#eventBus.on('user:logout', () => {
      this.#state.user = null;
      this.#clearPersistedState();
      this.#logger.info('User logged out');
    });

    // Cambios de vista
    this.#eventBus.on('view:change', (data) => {
      this.#state.currentView = data.view;
      this.#logger.debug('View changed', { view: data.view });
    });

    // Cambios de sesión
    this.#eventBus.on('session:created', (data) => {
      this.#state.currentSession = data.session;
      this.#saveState();
    });

    this.#eventBus.on('session:ended', () => {
      this.#state.currentSession = null;
      this.#saveState();
    });

    // Errores globales
    this.#eventBus.on('error:global', (data) => {
      this.#logger.error('Global error', data.error);
    });
  }

  registerService(name, service) {
    this.#container.register(name, () => service, { singleton: true });
    this.#eventBus.emit('service:registered', { name });
    this.#logger.info(`Service registered: ${name}`);
    return true;
  }

  getService(name) {
    try {
      return this.#container.resolve(name);
    } catch (error) {
      this.#logger.error(`Failed to get service: ${name}`, error);
      return null;
    }
  }

  setState(updates) {
    this.#state = {
      ...this.#state,
      ...updates
    };
    
    this.#eventBus.emit('state:updated', { state: this.#getPublicState() });
    
    if (this.#state.config.autoSaveState) {
      this.#saveState();
    }
  }

  getState() {
    return this.#getPublicState();
  }

  #getPublicState() {
    return {
      user: this.#state.user,
      currentView: this.#state.currentView,
      currentSession: this.#state.currentSession
    };
  }

  #saveState() {
    if (!this.#state.config.persistState) return;
    
    try {
      const stateToSave = {
        ...this.#getPublicState(),
        timestamp: Date.now()
      };
      
      localStorage.setItem('aulapudu:state', JSON.stringify(stateToSave));
      this.#logger.debug('State saved to localStorage');
    } catch (error) {
      this.#logger.error('Failed to save state', error);
    }
  }

  #loadPersistedState() {
    try {
      const saved = localStorage.getItem('aulapudu:state');
      if (!saved) return;

      const parsed = JSON.parse(saved);
      
      // Solo cargar si no es muy antiguo (24 horas)
      const age = Date.now() - parsed.timestamp;
      if (age < 24 * 60 * 60 * 1000) {
        this.#state.user = parsed.user;
        this.#state.currentView = parsed.currentView;
        this.#state.currentSession = parsed.currentSession;
        
        this.#logger.info('State loaded from localStorage');
      } else {
        this.#logger.info('Persisted state expired, clearing');
        this.#clearPersistedState();
      }
    } catch (error) {
      this.#logger.error('Failed to load persisted state', error);
    }
  }

  #clearPersistedState() {
    try {
      localStorage.removeItem('aulapudu:state');
      this.#logger.debug('Persisted state cleared');
    } catch (error) {
      this.#logger.error('Failed to clear persisted state', error);
    }
  }

  async destroy() {
    this.#logger.info('Destroying Core Engine...');
    
    this.#eventBus.removeAllListeners();
    this.#container.clear();
    
    this.#state.initialized = false;
    this.#logger.info('Core Engine destroyed');
  }

  getDiagnostics() {
    return {
      initialized: this.#state.initialized,
      services: Array.from(this.#container['_dependencies']?.keys() || []),
      user: this.#state.user ? {
        email: this.#state.user.email,
        role: this.#state.user.role
      } : null,
      currentView: this.#state.currentView,
      eventBusStats: this.#eventBus.getStats()
    };
  }
}

// Factory para crear instancias
export class CoreEngineFactory {
  static #instance = null;

  static getInstance(config = {}) {
    if (!this.#instance) {
      this.#instance = new CoreEngine(config);
    }
    return this.#instance;
  }

  static resetInstance() {
    if (this.#instance) {
      this.#instance.destroy();
      this.#instance = null;
    }
  }
}

export default CoreEngineFactory.getInstance();