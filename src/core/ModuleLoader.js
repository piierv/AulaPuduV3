/**
 * AULAPUDU 2.0 - MODULE LOADER
 * Cargador dinámico de módulos
 * 
 * Gestiona la carga y descarga de módulos bajo demanda
 */

class ModuleLoader {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.loadedModules = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Carga un módulo dinámicamente
   * @param {string} moduleName - Nombre del módulo
   * @param {Object} options - Opciones de carga
   */
  async loadModule(moduleName, options = {}) {
    // Si ya está cargado, retornar
    if (this.loadedModules.has(moduleName)) {
      return this.loadedModules.get(moduleName);
    }

    // Si ya se está cargando, esperar a que termine
    if (this.loadingPromises.has(moduleName)) {
      return await this.loadingPromises.get(moduleName);
    }

    // Crear promesa de carga
    const loadPromise = this._loadModuleInternal(moduleName, options);
    this.loadingPromises.set(moduleName, loadPromise);

    try {
      const module = await loadPromise;
      this.loadingPromises.delete(moduleName);
      return module;
    } catch (error) {
      this.loadingPromises.delete(moduleName);
      throw error;
    }
  }

  /**
   * Carga interna del módulo
   * @private
   */
  async _loadModuleInternal(moduleName, options) {
    try {
      console.log(`📦 Cargando módulo: ${moduleName}`);
      
      const modulePath = this.resolveModulePath(moduleName);
      
      // Importar módulo dinámicamente
      const moduleExport = await import(modulePath);
      const ModuleClass = moduleExport.default || moduleExport;

      // Instanciar módulo
      const moduleInstance = typeof ModuleClass === 'function'
        ? new ModuleClass(this.eventBus, options)
        : ModuleClass;

      // Inicializar si tiene método init
      if (typeof moduleInstance.init === 'function') {
        await moduleInstance.init();
      }

      // Registrar módulo cargado
      this.loadedModules.set(moduleName, moduleInstance);

      this.eventBus.emit('module:loaded', {
        name: moduleName,
        timestamp: Date.now()
      });

      console.log(`✅ Módulo cargado: ${moduleName}`);
      return moduleInstance;
    } catch (error) {
      console.error(`❌ Error cargando módulo '${moduleName}':`, error);
      
      this.eventBus.emit('module:error', {
        name: moduleName,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Resuelve la ruta del módulo
   * @private
   */
  resolveModulePath(moduleName) {
    const modulePaths = {
      'router': '../utils/Router.js',
      'ui': '../ui/components/UIManager.js',
      'auth': '../services/auth/AuthService.js',
      'session': '../services/session/SessionService.js',
      'exams': '../services/exams/ExamService.js',
      'realtime': '../services/realtime/RealtimeService.js'
    };

    const path = modulePaths[moduleName];
    
    if (!path) {
      throw new Error(`Módulo '${moduleName}' no tiene ruta definida`);
    }

    return path;
  }

  /**
   * Descarga un módulo
   * @param {string} moduleName - Nombre del módulo
   */
  async unloadModule(moduleName) {
    const module = this.loadedModules.get(moduleName);
    
    if (!module) {
      console.warn(`⚠️ Módulo '${moduleName}' no está cargado`);
      return false;
    }

    try {
      // Llamar destroy si existe
      if (typeof module.destroy === 'function') {
        await module.destroy();
      }

      this.loadedModules.delete(moduleName);
      
      this.eventBus.emit('module:unloaded', {
        name: moduleName
      });

      console.log(`📦 Módulo descargado: ${moduleName}`);
      return true;
    } catch (error) {
      console.error(`❌ Error descargando módulo '${moduleName}':`, error);
      return false;
    }
  }

  /**
   * Obtiene un módulo cargado
   * @param {string} moduleName - Nombre del módulo
   */
  getModule(moduleName) {
    return this.loadedModules.get(moduleName) || null;
  }

  /**
   * Verifica si un módulo está cargado
   * @param {string} moduleName - Nombre del módulo
   */
  isLoaded(moduleName) {
    return this.loadedModules.has(moduleName);
  }

  /**
   * Recarga un módulo
   * @param {string} moduleName - Nombre del módulo
   */
  async reloadModule(moduleName) {
    await this.unloadModule(moduleName);
    return await this.loadModule(moduleName);
  }

  /**
   * Lista todos los módulos cargados
   */
  listModules() {
    return Array.from(this.loadedModules.keys());
  }
}

export default ModuleLoader;