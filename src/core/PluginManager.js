/**
 * AULAPUDU 2.0 - PLUGIN MANAGER
 * Gestor de plugins y extensiones
 * 
 * Permite extender funcionalidad mediante plugins
 */

class PluginManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.plugins = new Map();
    this.hooks = new Map();
  }

  /**
   * Registra un plugin
   * @param {Object} plugin - Objeto del plugin
   * @param {Object} options - Opciones de configuración
   */
  async register(plugin, options = {}) {
    if (!plugin.name) {
      throw new Error('Plugin debe tener un nombre');
    }

    if (this.plugins.has(plugin.name)) {
      console.warn(`⚠️ Plugin '${plugin.name}' ya está registrado`);
      return false;
    }

    try {
      // Validar plugin
      this.validatePlugin(plugin);

      // Inicializar plugin si tiene método init
      if (typeof plugin.init === 'function') {
        await plugin.init(options);
      }

      // Registrar plugin
      this.plugins.set(plugin.name, {
        instance: plugin,
        options,
        enabled: true,
        registeredAt: Date.now()
      });

      // Emitir evento
      this.eventBus.emit('plugin:registered', {
        name: plugin.name,
        version: plugin.version
      });

      console.log(`🔌 Plugin registrado: ${plugin.name} v${plugin.version}`);
      return true;
    } catch (error) {
      console.error(`❌ Error registrando plugin '${plugin.name}':`, error);
      return false;
    }
  }

  /**
   * Valida estructura del plugin
   * @private
   */
  validatePlugin(plugin) {
    const required = ['name', 'version'];
    
    for (const field of required) {
      if (!plugin[field]) {
        throw new Error(`Plugin debe tener campo '${field}'`);
      }
    }

    return true;
  }

  /**
   * Desregistra un plugin
   * @param {string} name - Nombre del plugin
   */
  async unregister(name) {
    const plugin = this.plugins.get(name);
    
    if (!plugin) {
      console.warn(`⚠️ Plugin '${name}' no encontrado`);
      return false;
    }

    try {
      // Llamar destroy si existe
      if (typeof plugin.instance.destroy === 'function') {
        await plugin.instance.destroy();
      }

      this.plugins.delete(name);
      
      this.eventBus.emit('plugin:unregistered', { name });
      console.log(`🔌 Plugin desregistrado: ${name}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Error desregistrando plugin '${name}':`, error);
      return false;
    }
  }

  /**
   * Obtiene un plugin
   * @param {string} name - Nombre del plugin
   */
  getPlugin(name) {
    const plugin = this.plugins.get(name);
    return plugin ? plugin.instance : null;
  }

  /**
   * Habilita un plugin
   * @param {string} name - Nombre del plugin
   */
  enable(name) {
    const plugin = this.plugins.get(name);
    
    if (!plugin) {
      return false;
    }

    plugin.enabled = true;
    this.eventBus.emit('plugin:enabled', { name });
    return true;
  }

  /**
   * Deshabilita un plugin
   * @param {string} name - Nombre del plugin
   */
  disable(name) {
    const plugin = this.plugins.get(name);
    
    if (!plugin) {
      return false;
    }

    plugin.enabled = false;
    this.eventBus.emit('plugin:disabled', { name });
    return true;
  }

  /**
   * Verifica si un plugin está habilitado
   * @param {string} name - Nombre del plugin
   */
  isEnabled(name) {
    const plugin = this.plugins.get(name);
    return plugin ? plugin.enabled : false;
  }

  /**
   * Registra un hook
   * @param {string} hookName - Nombre del hook
   * @param {Function} callback - Función a ejecutar
   * @param {number} priority - Prioridad (mayor = primero)
   */
  registerHook(hookName, callback, priority = 10) {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, []);
    }

    this.hooks.get(hookName).push({
      callback,
      priority
    });

    // Ordenar por prioridad
    this.hooks.get(hookName).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Ejecuta un hook
   * @param {string} hookName - Nombre del hook
   * @param {*} data - Datos a pasar
   */
  async executeHook(hookName, data = null) {
    if (!this.hooks.has(hookName)) {
      return data;
    }

    let result = data;
    const hooks = this.hooks.get(hookName);

    for (const hook of hooks) {
      try {
        result = await hook.callback(result);
      } catch (error) {
        console.error(`❌ Error ejecutando hook '${hookName}':`, error);
      }
    }

    return result;
  }

  /**
   * Lista todos los plugins registrados
   */
  listPlugins() {
    return Array.from(this.plugins.entries()).map(([name, plugin]) => ({
      name,
      version: plugin.instance.version,
      enabled: plugin.enabled,
      description: plugin.instance.description || 'Sin descripción'
    }));
  }
}

export default PluginManager;