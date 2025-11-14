/**
 * AULAPUDU 2.0 - DEPENDENCY INJECTION CONTAINER
 * Contenedor de inyección de dependencias
 */

export class DIContainer {
  #dependencies = new Map();
  #singletons = new Map();
  #resolving = new Set();

  /**
   * Registra una dependencia
   * @param {string} name - Nombre de la dependencia
   * @param {Function} factory - Función factory que crea la instancia
   * @param {Object} options - Opciones de configuración
   */
  register(name, factory, options = {}) {
    if (typeof factory !== 'function') {
      throw new Error(`Factory for '${name}' must be a function`);
    }

    this.#dependencies.set(name, {
      factory,
      singleton: options.singleton ?? false,
      dependencies: options.dependencies || []
    });
  }

  /**
   * Resuelve una dependencia
   * @param {string} name - Nombre de la dependencia
   * @returns {*} Instancia de la dependencia
   */
  resolve(name) {
    // Verificar dependencia circular
    if (this.#resolving.has(name)) {
      throw new Error(`Circular dependency detected: ${name}`);
    }

    const dependency = this.#dependencies.get(name);
    
    if (!dependency) {
      throw new Error(`Dependency '${name}' not registered`);
    }

    // Si es singleton y ya existe, retornarlo
    if (dependency.singleton && this.#singletons.has(name)) {
      return this.#singletons.get(name);
    }

    // Marcar como resolviendo
    this.#resolving.add(name);

    try {
      // Crear instancia
      const instance = dependency.factory(this);

      // Si es singleton, guardarlo
      if (dependency.singleton) {
        this.#singletons.set(name, instance);
      }

      return instance;
    } finally {
      // Desmarcar
      this.#resolving.delete(name);
    }
  }

  /**
   * Verifica si una dependencia está registrada
   */
  has(name) {
    return this.#dependencies.has(name);
  }

  /**
   * Limpia el contenedor
   */
  clear() {
    this.#dependencies.clear();
    this.#singletons.clear();
    this.#resolving.clear();
  }

  /**
   * Limpia singletons (útil para testing)
   */
  clearSingletons() {
    this.#singletons.clear();
  }
}

export default DIContainer;