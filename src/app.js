/**
 * AULAPUDU 2.0 - MAIN APPLICATION (DEBUG VERSION)
 */

import { CoreEngineFactory } from './core/CoreEngine.js';
import { setupDependencies } from './config/container.js';
import { initializeSupabase } from './config/supabase.js';

class AulaPuduApp {
  constructor() {
    this.initialized = false;
    this.coreEngine = null;
    this.router = null;
    this.modal = null;
    this.supabaseClient = null;
  }

  async init() {
    try {
      console.log('🚀 Iniciando AulaPudu 2.0...');

      // DEBUG: Verificar que estamos en el navegador
      if (typeof window === 'undefined') {
        throw new Error('Esta aplicación solo funciona en el navegador');
      }

      // 1. Inicializar Supabase
      console.log('1. Inicializando Supabase...');
      this.supabaseClient = await this.initializeSupabaseWithRetry();
      
      // 2. Inicializar Core Engine
      console.log('2. Inicializar Core Engine...');
      this.coreEngine = CoreEngineFactory.getInstance({
        debug: true,
        persistState: true
      });
      await this.coreEngine.initialize();

      // 3. Configurar Dependency Injection
      console.log('3. Configurando dependencias...');
      setupDependencies(this.coreEngine.container, this.supabaseClient);

      // 4. Inicializar servicios
      console.log('4. Inicializando servicios...');
      await this.initializeServices();

      // 5. Configurar router
      console.log('5. Configurando router...');
      this.setupRouter();

      // 6. Configurar notificaciones
      console.log('6. Configurando notificaciones...');
      this.setupNotifications();

      // 7. Configurar modales
      console.log('7. Configurando modales...');
      this.setupModals();

      // 8. Navegar a ruta inicial
      console.log('8. Navegando a ruta inicial...');
      this.navigateToInitialRoute();

      // 9. Ocultar loading screen
      console.log('9. Ocultando loading screen...');
      this.hideLoadingScreen();

      this.initialized = true;
      console.log('✅ AulaPudu 2.0 iniciado correctamente');    } catch (error) {
      console.error('❌ Error fatal inicializando aplicación:', error);
      console.error('Stack trace:', error.stack);
      this.showFatalError(error);
    }
  }

  checkDependencies() {
    const dependencies = {
      'window.supabase': typeof window.supabase,
      'window.supabase.createClient': typeof window.supabase?.createClient,
      'QRCode': typeof QRCode,
      'localStorage': typeof localStorage,
      'Promise': typeof Promise
    };

    console.log('📦 Dependencias cargadas:', dependencies);

    // Verificar dependencias críticas
    if (!window.supabase) {
      throw new Error('Supabase library no está cargada. Verifica el script en el HTML.');
    }

    if (!QRCode) {
      console.warn('⚠️ QRCode library no está cargada, pero la aplicación puede continuar');
    }
  }

  async initializeSupabaseWithRetry() {
    try {
      const supabaseClient = await initializeSupabase();
      console.log('✅ Supabase inicializado correctamente');
      return supabaseClient;
    } catch (error) {
      console.error('❌ Error inicializando Supabase:', error);
      
      // Si falla Supabase, continuar en modo demo
      console.warn('🔄 Continuando en modo demo (sin base de datos)...');
      
      // Crear cliente mock de Supabase
      return this.createMockSupabaseClient();
    }
  }

  createMockSupabaseClient() {
    console.log('🔧 Creando cliente mock de Supabase...');
    
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Modo demo' } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Modo demo' } }),
        signOut: () => Promise.resolve({ error: null })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { code: 'PGRST116' } })
          })
        })
      })
    };
  }

  async initializeServices() {
    try {
      const container = this.coreEngine.container;
      const eventBus = this.coreEngine.eventBus;

      // Resolver servicios del contenedor
      const authService = container.resolve('authService');
      const sessionService = container.resolve('sessionService');
      const realtimeService = container.resolve('realtimeService');

      // Inicializar AuthService
      await authService.init();

      // Registrar servicios en el CoreEngine para compatibilidad
      this.coreEngine.registerService('auth', authService);
      this.coreEngine.registerService('session', sessionService);
      this.coreEngine.registerService('realtime', realtimeService);

      // Configurar listeners de autenticación
      this.setupAuthListeners();

      console.log('✅ Servicios inicializados correctamente');
    } catch (error) {
      console.error('❌ Error inicializando servicios:', error);
      throw error;
    }
  }

  setupAuthListeners() {
    const eventBus = this.coreEngine.eventBus;
    const authService = this.coreEngine.getService('auth');

    eventBus.on('auth:check', (data) => {
      const isAuth = authService.isAuthenticated();
      data.callback(isAuth);
    });

    eventBus.on('auth:checkRole', (data) => {
      const hasRole = authService.hasAnyRole(data.roles);
      data.callback(hasRole);
    });
  }

  setupRouter() {
    try {
      const appContainer = document.getElementById('app');
      
      if (!appContainer) {
        throw new Error('No se encontró el contenedor de la aplicación con id "app"');
      }

      // Importar componentes dinámicamente para evitar errores de carga
      this.setupLazyRouter();
      
      console.log('✅ Router configurado correctamente');
    } catch (error) {
      console.error('❌ Error configurando router:', error);
      throw error;
    }
  }

  async setupLazyRouter() {
    try {
      // Cargar el router y componentes dinámicamente
      const { default: Router } = await import('./utils/Router.js');
      const { default: LandingPage } = await import('./ui/pages/LandingPage.js');
      const { default: LoginPage } = await import('./ui/pages/LoginPage.js');
      const { default: JoinPage } = await import('./ui/pages/JoinPage.js');
      const { default: DashboardPage } = await import('./ui/pages/DashboardPage.js');
      const { default: SpectatorPage } = await import('./ui/pages/SpectatorPage.js');
      const { default: PresenterSessionPage } = await import('./ui/pages/PresenterSessionPage.js');

      const appContainer = document.getElementById('app');
      const eventBus = this.coreEngine.eventBus;
      
      this.router = new Router(eventBus);

      // Obtener servicios
      const authService = this.coreEngine.getService('auth');
      const sessionService = this.coreEngine.getService('session');
      const realtimeService = this.coreEngine.getService('realtime');
      const dashboardRenderer = this.coreEngine.container.resolve('dashboardRenderer');
      const sessionSetupUtils = this.coreEngine.container.resolve('sessionSetupUtils');

      // Registrar rutas
      this.router.register('landing', {
        component: (data) => new LandingPage(eventBus, data),
        path: '/',
        default: true
      });

      this.router.register('login', {
        component: (data) => new LoginPage(eventBus, authService, data),
        path: '/login'
      });

      this.router.register('join', {
        component: (data) => new JoinPage(eventBus, sessionService, data),
        path: '/join'
      });

      this.router.register('dashboard', {
        component: (data) => new DashboardPage(eventBus, sessionService, authService, dashboardRenderer, sessionSetupUtils, data),
        path: '/dashboard',
        requiresAuth: true,
        roles: ['presenter']
      });

      this.router.register('spectator', {
        component: (data) => new SpectatorPage(eventBus, realtimeService, data),
        path: '/spectator'
      });

      this.router.register('presenter-session', {
        component: (data) => new PresenterSessionPage(eventBus, sessionService, authService, realtimeService, data),
        path: '/presenter/session',
        requiresAuth: true,
        roles: ['presenter']
      });

      this.router.init(appContainer);
      
    } catch (error) {
      console.error('❌ Error cargando componentes del router:', error);
      
      // Fallback: Mostrar página básica
      this.showFallbackUI();
    }
  }

  showFallbackUI() {
    const appContainer = document.getElementById('app');
    if (appContainer) {
      appContainer.innerHTML = `
        <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif;">
          <h1>🎯 AulaPudu 2.0</h1>
          <p>La aplicación se está cargando en modo de compatibilidad...</p>
          <div style="margin: 30px 0;">
            <button onclick="window.location.reload()" style="padding: 10px 20px; margin: 5px;">Recargar</button>
            <button onclick="window.AulaPudu?.showDebugInfo()" style="padding: 10px 20px; margin: 5px;">Depurar</button>
          </div>
          <div style="margin-top: 20px; padding: 20px; background: #f5f5f5; border-radius: 8px; display: inline-block;">
            <h3>Accesos Rápidos</h3>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 10px;">
              <button onclick="window.AulaPudu?.navigateTo('landing')" style="padding: 8px 16px;">Inicio</button>
              <button onclick="window.AulaPudu?.navigateTo('login')" style="padding: 8px 16px;">Login</button>
              <button onclick="window.AulaPudu?.navigateTo('join')" style="padding: 8px 16px;">Unirse</button>
            </div>
          </div>
        </div>
      `;
    }
  }

  setupNotifications() {
    try {
      const eventBus = this.coreEngine.eventBus;
      const container = document.getElementById('notifications');

      if (!container) {
        console.warn('⚠️ No se encontró el contenedor de notificaciones');
        return;
      }

      eventBus.on('notification:show', (data) => {
        this.showNotification(container, data);
      });

      console.log('✅ Sistema de notificaciones configurado');
    } catch (error) {
      console.error('❌ Error configurando notificaciones:', error);
    }
  }

  setupModals() {
    try {
      const { default: Modal } = import('./ui/components/Modal.js');
      this.modal = new Modal(this.coreEngine.eventBus);
      console.log('✅ Sistema de modales configurado');
    } catch (error) {
      console.error('❌ Error configurando modales:', error);
      // Continuar sin modales
    }
  }

  showNotification(container, { type, message, title, duration = 3000 }) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      background: white;
      padding: 16px;
      margin: 10px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      border-left: 4px solid var(--color-${type});
      animation: slideInRight 0.3s ease;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <div style="font-size: 20px;">
          ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
        </div>
        <div style="flex: 1;">
          ${title ? `<div style="font-weight: bold; margin-bottom: 4px;">${title}</div>` : ''}
          <div>${message}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer;">✕</button>
      </div>
    `;

    container.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  }

  navigateToInitialRoute() {
    try {
      const path = window.location.pathname;
      const state = this.coreEngine.getState();

      // Si hay un usuario autenticado, redirigir según rol
      if (state.user) {
        this.eventBus.emit('navigate', { view: 'dashboard' });
        return;
      }

      // Navegar según la ruta actual
      if (path === '/login' || path.includes('login')) {
        this.eventBus.emit('navigate', { view: 'login' });
      } else if (path === '/join' || path.includes('join')) {
        this.eventBus.emit('navigate', { view: 'join' });
      } else {
        this.eventBus.emit('navigate', { view: 'landing' });
      }
    } catch (error) {
      console.error('❌ Error en navegación inicial:', error);
      // Fallback a landing page
      this.eventBus.emit('navigate', { view: 'landing' });
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      loadingScreen.style.transition = 'opacity 0.5s ease';
      
      setTimeout(() => {
        loadingScreen.remove();
      }, 500);
    }
  }

  showFatalError(error) {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.innerHTML = `
        <div class="loading-content" style="color: #e74c3c; text-align: center; max-width: 500px; padding: 20px;">
          <h2>❌ Error Inicializando AulaPudu</h2>
          <p style="margin: 20px 0; background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #e74c3c;">
            <strong>Error:</strong> ${error.message}
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button onclick="window.location.reload()" class="btn btn-primary">
              🔄 Recargar Página
            </button>
            <button onclick="window.showDebugInfo()" class="btn btn-outline">
              🐛 Información de Depuración
            </button>
          </div>
          <div style="margin-top: 20px; font-size: 14px; color: #666;">
            <p>Si el problema persiste, contacta al administrador.</p>
          </div>
        </div>
      `;
    }
  }

  // Métodos de depuración globales
  showDebugInfo() {
    const info = {
      appInitialized: this.initialized,
      supabaseClient: !!this.supabaseClient,
      coreEngine: !!this.coreEngine,
      router: !!this.router,
      dependencies: {
        supabase: typeof window.supabase,
        QRCode: typeof QRCode
      },
      environment: {
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    };
    
    console.log('🐛 Información de Depuración:', info);
    alert('Información de Depuración (ver consola para detalles)\n\n' + 
          `App Inicializada: ${info.appInitialized}\n` +
          `Supabase: ${info.dependencies.supabase}\n` +
          `Router: ${info.router}`);
  }

  navigateTo(view) {
    if (this.router) {
      this.router.navigate(view);
    } else {
      this.eventBus.emit('navigate', { view });
    }
  }

  async destroy() {
    if (this.coreEngine) {
      await this.coreEngine.destroy();
    }
    CoreEngineFactory.resetInstance();
    this.initialized = false;
  }
}

// Crear instancia de la aplicación
const app = new AulaPuduApp();

// Hacer disponible globalmente para depuración
window.AulaPudu = app;
window.showDebugInfo = () => app.showDebugInfo();

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado, iniciando aplicación...');
    app.init();
  });
} else {
  console.log('⚡ DOM ya listo, iniciando aplicación...');
  app.init();
}

export default app;