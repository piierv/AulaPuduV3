/**
 * AULAPUDU 2.0 - DEPENDENCY INJECTION SETUP
 */

import Logger from '../core/Logger.js';
import EventBus from '../core/EventBus.js';

// Repositories
import SessionRepository from '../domain/repositories/SessionRepository.js';
import AttendeeRepository from '../domain/repositories/AttendeeRepository.js';

// Services
import SessionService from '../domain/services/SessionService.js';
import AuthService from '../domain/services/AuthService.js';
import DashboardRenderer from '../ui/renderers/DashboardRenderer.js';
import RealtimeService from '../services/realtime/RealtimeService.js';
import { sessionSetupUtils } from '../services/SessionSetupUtils.js';

/**
 * Detecta si estamos en desarrollo
 */
function isDevelopment() {
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * Configura todas las dependencias en el contenedor
 * @param {DIContainer} container - Contenedor de dependencias
 * @param {Object} supabaseClient - Cliente de Supabase ya inicializado
 */
export function setupDependencies(container, supabaseClient) {
  const logLevel = isDevelopment() ? 'debug' : 'info';
  
  // Core - Logger
  container.register('logger', () => {
    return new Logger({
      level: logLevel,
      context: 'AulaPudu'
    });
  }, { singleton: true });

  // Core - EventBus
  container.register('eventBus', (c) => {
    const logger = c.resolve('logger');
    return new EventBus(logger);
  }, { singleton: true });

  // Infrastructure - Supabase Client (YA INICIALIZADO)
  container.register('supabaseClient', () => {
    return supabaseClient; // ✅ Devolver el cliente ya inicializado
  }, { singleton: true });

  // Repositories
  container.register('sessionRepository', (c) => {
    const supabase = c.resolve('supabaseClient');
    const logger = c.resolve('logger');
    return new SessionRepository(supabase, logger);
  }, { singleton: true });

  container.register('attendeeRepository', (c) => {
    const supabase = c.resolve('supabaseClient');
    const logger = c.resolve('logger');
    return new AttendeeRepository(supabase, logger);
  }, { singleton: true });

  // Services
  container.register('sessionService', (c) => {
    const sessionRepo = c.resolve('sessionRepository');
    const attendeeRepo = c.resolve('attendeeRepository');
    const eventBus = c.resolve('eventBus');
    const logger = c.resolve('logger');
    return new SessionService(sessionRepo, attendeeRepo, eventBus, logger);
  }, { singleton: true });

  container.register('authService', (c) => {
    const supabase = c.resolve('supabaseClient');
    const eventBus = c.resolve('eventBus');
    const logger = c.resolve('logger');
    return new AuthService(supabase, eventBus, logger);
  }, { singleton: true });

  container.register('realtimeService', (c) => {
    const supabase = c.resolve('supabaseClient');
    const eventBus = c.resolve('eventBus');
    const logger = c.resolve('logger');
    return new RealtimeService(supabase, eventBus, logger);
  }, { singleton: true });

  // UI Renderers
  container.register('dashboardRenderer', () => {
    return new DashboardRenderer();
  }, { singleton: true });

  container.register('sessionSetupUtils', () => {
    return sessionSetupUtils;
  }, { singleton: true });
}

export default setupDependencies;