/**
 * AULAPUDU 2.0 - ENVIRONMENT CONFIGURATION
 * Configuración de entorno para el navegador
 */

/**
 * Detecta el entorno actual
 */
export function getEnvironment() {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }
  
  if (hostname.includes('staging') || hostname.includes('dev')) {
    return 'staging';
  }
  
  return 'production';
}

/**
 * Verifica si estamos en desarrollo
 */
export function isDevelopment() {
  return getEnvironment() === 'development';
}

/**
 * Verifica si estamos en producción
 */
export function isProduction() {
  return getEnvironment() === 'production';
}

/**
 * Configuración general de la aplicación
 */
export const config = {
  environment: getEnvironment(),
  isDevelopment: isDevelopment(),
  isProduction: isProduction(),
  
  // Logging
  logLevel: isDevelopment() ? 'debug' : 'info',
  
  // Features
  features: {
    enableAnalytics: isProduction(),
    enableDebugTools: isDevelopment(),
    enableServiceWorker: isProduction()
  },
  
  // API
  api: {
    timeout: 30000,
    retries: 3
  }
};

export default config;