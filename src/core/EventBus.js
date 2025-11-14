/**
 * AULAPUDU 2.0 - EVENT BUS (MEJORADO)
 * Sistema central de comunicación con mejor encapsulación
 */

export class EventBus {
  #listeners = new Map();
  #history = [];
  #maxHistorySize = 100;
  #debug = false;
  #logger = null;

  constructor(logger = null) {
    this.#logger = logger;
  }

  initialize(config = {}) {
    this.#debug = config.debug || false;
    this.#maxHistorySize = config.maxHistorySize || 100;
    
    if (this.#debug && this.#logger) {
      this.#logger.info('EventBus initialized', { maxHistorySize: this.#maxHistorySize });
    }
  }

  on(event, callback, options = {}) {
    if (!event || typeof callback !== 'function') {
      throw new Error('Event name and callback are required');
    }

    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, []);
    }

    const listener = {
      callback,
      once: options.once || false,
      priority: options.priority || 0,
      context: options.context || null,
      id: Symbol('listener')
    };

    this.#listeners.get(event).push(listener);
    this.#listeners.get(event).sort((a, b) => b.priority - a.priority);

    if (this.#debug && this.#logger) {
      this.#logger.debug(`Listener registered for event: ${event}`, {
        priority: listener.priority,
        once: listener.once
      });
    }

    // Retornar función de desuscripción
    return () => this.#removeListener(event, listener.id);
  }

  once(event, callback, options = {}) {
    return this.on(event, callback, { ...options, once: true });
  }

  off(event, callback) {
    if (!this.#listeners.has(event)) return;

    const listeners = this.#listeners.get(event);
    const index = listeners.findIndex(l => l.callback === callback);

    if (index !== -1) {
      listeners.splice(index, 1);
      
      if (this.#debug && this.#logger) {
        this.#logger.debug(`Listener removed from event: ${event}`);
      }
    }

    if (listeners.length === 0) {
      this.#listeners.delete(event);
    }
  }

  #removeListener(event, listenerId) {
    if (!this.#listeners.has(event)) return;

    const listeners = this.#listeners.get(event);
    const index = listeners.findIndex(l => l.id === listenerId);

    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      this.#listeners.delete(event);
    }
  }

  emit(event, data = null) {
    this.#addToHistory(event, data);

    if (!this.#listeners.has(event)) {
      if (this.#debug && this.#logger) {
        this.#logger.debug(`Event emitted with no listeners: ${event}`);
      }
      return;
    }

    const listeners = [...this.#listeners.get(event)];
    const listenersToRemove = [];

    if (this.#debug && this.#logger) {
      this.#logger.debug(`Emitting event: ${event}`, { listenerCount: listeners.length });
    }

    listeners.forEach(listener => {
      try {
        if (listener.context) {
          listener.callback.call(listener.context, data);
        } else {
          listener.callback(data);
        }

        if (listener.once) {
          listenersToRemove.push(listener.id);
        }
      } catch (error) {
        if (this.#logger) {
          this.#logger.error(`Error in listener for event '${event}'`, error);
        } else {
          console.error(`Error in listener for '${event}':`, error);
        }
        this.emit('error:listener', { event, error });
      }
    });

    listenersToRemove.forEach(id => this.#removeListener(event, id));
  }

  async emitAsync(event, data = null) {
    this.#addToHistory(event, data);

    if (!this.#listeners.has(event)) return;

    const listeners = [...this.#listeners.get(event)];
    const listenersToRemove = [];

    for (const listener of listeners) {
      try {
        if (listener.context) {
          await listener.callback.call(listener.context, data);
        } else {
          await listener.callback(data);
        }

        if (listener.once) {
          listenersToRemove.push(listener.id);
        }
      } catch (error) {
        if (this.#logger) {
          this.#logger.error(`Error in async listener for event '${event}'`, error);
        }
        this.emit('error:listener', { event, error });
      }
    }

    listenersToRemove.forEach(id => this.#removeListener(event, id));
  }

  hasListeners(event) {
    return this.#listeners.has(event) && this.#listeners.get(event).length > 0;
  }

  getListenerCount(event = null) {
    if (event) {
      return this.#listeners.has(event) ? this.#listeners.get(event).length : 0;
    }

    let count = 0;
    this.#listeners.forEach(listeners => {
      count += listeners.length;
    });
    return count;
  }

  getEvents() {
    return Array.from(this.#listeners.keys());
  }

  removeAllListeners(event = null) {
    if (event) {
      this.#listeners.delete(event);
    } else {
      this.#listeners.clear();
    }
  }

  #addToHistory(event, data) {
    this.#history.push({
      event,
      data,
      timestamp: Date.now()
    });

    if (this.#history.length > this.#maxHistorySize) {
      this.#history.shift();
    }
  }

  getHistory(limit = 10) {
    return [...this.#history.slice(-limit)];
  }

  clearHistory() {
    this.#history = [];
  }

  createNamespace(namespace) {
    return {
      on: (event, callback, options) => 
        this.on(`${namespace}:${event}`, callback, options),
      once: (event, callback) => 
        this.once(`${namespace}:${event}`, callback),
      off: (event, callback) => 
        this.off(`${namespace}:${event}`, callback),
      emit: (event, data) => 
        this.emit(`${namespace}:${event}`, data),
      emitAsync: (event, data) => 
        this.emitAsync(`${namespace}:${event}`, data)
    };
  }

  getStats() {
    return {
      totalListeners: this.getListenerCount(),
      totalEvents: this.#listeners.size,
      events: this.getEvents(),
      historySize: this.#history.length
    };
  }
}

export default EventBus;