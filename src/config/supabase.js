/**
 * AULAPUDU 2.0 - SUPABASE CONFIGURATION
 * Configuración central de Supabase
 */

// IMPORTANTE: Reemplazar con tus credenciales reales de Supabase
// En /src/config/supabase.js
const SUPABASE_URL = 'https://aoogpmeulctbhcisrgeh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvb2dwbWV1bGN0YmhjaXNyZ2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTU3ODksImV4cCI6MjA3ODI5MTc4OX0.0D7Fbstx3sWZkBzkHW3ropEVQWaG2W6cRsJNTVaJbFs';

export async function initializeSupabase() {
  if (typeof window === 'undefined') {
    throw new Error('Supabase solo puede inicializarse en el navegador');
  }

  try {
    console.log('🔌 Inicializando Supabase...');
    
    // Verificar que la librería esté cargada
    if (!window.supabase) {
      throw new Error('La librería de Supabase no está cargada');
    }

    const { createClient } = window.supabase;
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });

    // Test connection
    const { data, error } = await supabaseClient.from('sessions').select('count').limit(1);
    if (error) {
      console.warn('⚠️ Supabase conectado pero error en test:', error);
    } else {
      console.log('✅ Supabase inicializado correctamente');
    }

    return supabaseClient;
  } catch (error) {
    console.error('❌ Error fatal inicializando Supabase:', error);
    throw error;
  }
}

/**
 * Obtiene el cliente de Supabase
 */
export function getSupabaseClient() {
  if (!supabaseClient) {
    throw new Error('Supabase no ha sido inicializado. Llama a initializeSupabase() primero');
  }
  return supabaseClient;
}

/**
 * Valida la configuración de Supabase
 */
export function validateConfig() {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
    console.error('❌ Configuración de Supabase no establecida correctamente');
    return false;
  }
  return true;
}

export default {
  config: supabaseConfig,
  initialize: initializeSupabase,
  getClient: getSupabaseClient,
  validate: validateConfig
};
// En /src/config/supabase.js - VAMOS A VERIFICAR
console.log('🔌 Probando conexión Supabase...');

// Agregar esto después de inicializar supabaseClient
const testConnection = async () => {
  try {
    const { data, error } = await supabaseClient.from('sessions').select('count');
    if (error) throw error;
    console.log('✅ Supabase conectado correctamente');
  } catch (error) {
    console.error('❌ Error conectando a Supabase:', error);
  }
};
testConnection();