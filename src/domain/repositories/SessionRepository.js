/**
 * AULAPUDU 2.0 - SESSION REPOSITORY
 * Repositorio para operaciones de sesiones con Supabase
 */

import IRepository from './IRepository.js';
import Session from '../models/Session.js';
import { SessionNotFoundError } from '../errors/SessionError.js';
import RepositoryError from '../errors/RepositoryError.js';

export class SessionRepository extends IRepository {
  constructor(supabaseClient, logger) {
    super();
    this.client = supabaseClient;
    this.logger = logger.createChild({ context: 'SessionRepository' });
  }

  /**
   * Busca una sesión por ID
   */
  async findById(id) {
    this.logger.debug('Finding session by ID', { id });

    try {
      const { data, error } = await this.client
        .from('sessions')
        .select(`
          *,
          attendees (
            id,
            name,
            status,
            joined_at
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new SessionNotFoundError(id);
        }
        throw error;
      }

      this.logger.debug('Session found', { id });
      return new Session(data);
    } catch (error) {
      if (error instanceof SessionNotFoundError) {
        throw error;
      }
      this.logger.error('Error finding session by ID', error, { id });
      throw new RepositoryError('Failed to find session', error);
    }
  }

  /**
   * Busca una sesión por código
   */
  async findByCode(code) {
    this.logger.debug('Finding session by code', { code });

    try {
      const { data, error } = await this.client
        .from('sessions')
        .select(`
          *,
          attendees (
            id,
            name,
            status,
            joined_at
          )
        `)
        .eq('code', code.toUpperCase())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new SessionNotFoundError(code);
        }
        throw error;
      }

      this.logger.debug('Session found by code', { code });
      return new Session(data);
    } catch (error) {
      if (error instanceof SessionNotFoundError) {
        throw error;
      }
      this.logger.error('Error finding session by code', error, { code });
      throw new RepositoryError('Failed to find session', error);
    }
  }

  /**
   * Busca todas las sesiones (con filtros opcionales)
   */
  async findAll(filters = {}) {
    this.logger.debug('Finding all sessions', { filters });

    try {
      let query = this.client
        .from('sessions')
        .select('*');

      // Aplicar filtros
      if (filters.presenterId) {
        query = query.eq('presenter_id', filters.presenterId);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      // Ordenar
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      this.logger.debug('Sessions found', { count: data.length });
      return data.map(session => new Session(session));
    } catch (error) {
      this.logger.error('Error finding sessions', error, { filters });
      throw new RepositoryError('Failed to find sessions', error);
    }
  }

  /**
   * Busca sesiones activas de un presentador
   */
  async findActiveByPresenterId(presenterId) {
    return this.findAll({
      presenterId,
      status: Session.STATUS.ACTIVE
    });
  }

  /**
   * Guarda una nueva sesión
   */
  async save(session) {
    this.logger.debug('Saving new session', { title: session.title });

    try {
      const sessionData = session.toJSON();
      delete sessionData.id; // No incluir ID para nuevas sesiones

      const { data, error } = await this.client
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      this.logger.info('Session saved', { id: data.id, code: data.code });
      return new Session(data);
    } catch (error) {
      this.logger.error('Error saving session', error);
      throw new RepositoryError('Failed to save session', error);
    }
  }

  /**
   * Actualiza una sesión existente
   */
  async update(session) {
    this.logger.debug('Updating session', { id: session.id });

    try {
      const sessionData = session.toJSON();
      sessionData.updated_at = new Date().toISOString();

      const { data, error } = await this.client
        .from('sessions')
        .update(sessionData)
        .eq('id', session.id)
        .select()
        .single();

      if (error) throw error;

      this.logger.info('Session updated', { id: data.id });
      return new Session(data);
    } catch (error) {
      this.logger.error('Error updating session', error, { id: session.id });
      throw new RepositoryError('Failed to update session', error);
    }
  }

  /**
   * Elimina una sesión
   */
  async delete(id) {
    this.logger.debug('Deleting session', { id });

    try {
      const { error } = await this.client
        .from('sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this.logger.info('Session deleted', { id });
      return true;
    } catch (error) {
      this.logger.error('Error deleting session', error, { id });
      throw new RepositoryError('Failed to delete session', error);
    }
  }

  /**
   * Cuenta sesiones activas de un presentador
   */
  async countActiveByPresenterId(presenterId) {
    try {
      const { count, error } = await this.client
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('presenter_id', presenterId)
        .eq('status', Session.STATUS.ACTIVE);

      if (error) throw error;

      return count;
    } catch (error) {
      this.logger.error('Error counting active sessions', error, { presenterId });
      throw new RepositoryError('Failed to count sessions', error);
    }
  }
}

export default SessionRepository;