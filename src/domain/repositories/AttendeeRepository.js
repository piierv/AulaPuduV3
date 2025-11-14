/**
 * AULAPUDU 2.0 - ATTENDEE REPOSITORY
 * Repositorio para operaciones de asistentes
 */

import IRepository from './IRepository.js';
import Attendee from '../models/Attendee.js';
import RepositoryError from '../errors/RepositoryError.js';

export class AttendeeRepository extends IRepository {
  constructor(supabaseClient, logger) {
    super();
    this.client = supabaseClient;
    this.logger = logger.createChild({ context: 'AttendeeRepository' });
  }

  /**
   * Busca un asistente por ID
   */
  async findById(id) {
    this.logger.debug('Finding attendee by ID', { id });

    try {
      const { data, error } = await this.client
        .from('attendees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new RepositoryError(`Attendee not found: ${id}`);
        }
        throw error;
      }

      return new Attendee(data);
    } catch (error) {
      this.logger.error('Error finding attendee', error, { id });
      throw new RepositoryError('Failed to find attendee', error);
    }
  }

  /**
   * Busca todos los asistentes de una sesión
   */
  async findBySessionId(sessionId, filters = {}) {
    this.logger.debug('Finding attendees by session', { sessionId });

    try {
      let query = this.client
        .from('attendees')
        .select('*')
        .eq('session_id', sessionId);

      // Aplicar filtros
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Ordenar por fecha de unión
      query = query.order('joined_at', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      this.logger.debug('Attendees found', { count: data.length });
      return data.map(attendee => new Attendee(attendee));
    } catch (error) {
      this.logger.error('Error finding attendees', error, { sessionId });
      throw new RepositoryError('Failed to find attendees', error);
    }
  }

  /**
   * Busca asistentes activos de una sesión
   */
  async findActiveBySessionId(sessionId) {
    return this.findBySessionId(sessionId, { status: Attendee.STATUS.ACTIVE });
  }

  /**
   * Cuenta asistentes activos en una sesión
   */
  async countActiveBySessionId(sessionId) {
    try {
      const { count, error } = await this.client
        .from('attendees')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('status', Attendee.STATUS.ACTIVE);

      if (error) throw error;

      return count;
    } catch (error) {
      this.logger.error('Error counting attendees', error, { sessionId });
      throw new RepositoryError('Failed to count attendees', error);
    }
  }

  /**
   * Guarda un nuevo asistente
   */
  async save(attendee) {
    this.logger.debug('Saving new attendee', { name: attendee.name });

    try {
      const attendeeData = attendee.toJSON();
      delete attendeeData.id;

      const { data, error } = await this.client
        .from('attendees')
        .insert(attendeeData)
        .select()
        .single();

      if (error) throw error;

      this.logger.info('Attendee saved', { id: data.id, name: data.name });
      return new Attendee(data);
    } catch (error) {
      this.logger.error('Error saving attendee', error);
      throw new RepositoryError('Failed to save attendee', error);
    }
  }

  /**
   * Actualiza un asistente
   */
  async update(attendee) {
    this.logger.debug('Updating attendee', { id: attendee.id });

    try {
      const { data, error } = await this.client
        .from('attendees')
        .update(attendee.toJSON())
        .eq('id', attendee.id)
        .select()
        .single();

      if (error) throw error;

      this.logger.info('Attendee updated', { id: data.id });
      return new Attendee(data);
    } catch (error) {
      this.logger.error('Error updating attendee', error, { id: attendee.id });
      throw new RepositoryError('Failed to update attendee', error);
    }
  }

  /**
   * Elimina un asistente
   */
  async delete(id) {
    this.logger.debug('Deleting attendee', { id });

    try {
      const { error } = await this.client
        .from('attendees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      this.logger.info('Attendee deleted', { id });
      return true;
    } catch (error) {
      this.logger.error('Error deleting attendee', error, { id });
      throw new RepositoryError('Failed to delete attendee', error);
    }
  }

  /**
   * Marca todos los asistentes de una sesión como desconectados
   */
  async disconnectAllBySessionId(sessionId) {
    this.logger.debug('Disconnecting all attendees', { sessionId });

    try {
      const { error } = await this.client
        .from('attendees')
        .update({
          status: Attendee.STATUS.DISCONNECTED,
          left_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('status', Attendee.STATUS.ACTIVE);

      if (error) throw error;

      this.logger.info('All attendees disconnected', { sessionId });
      return true;
    } catch (error) {
      this.logger.error('Error disconnecting attendees', error, { sessionId });
      throw new RepositoryError('Failed to disconnect attendees', error);
    }
  }

  /**
   * Busca todos los asistentes (implementación de IRepository)
   */
  async findAll(filters = {}) {
    if (filters.sessionId) {
      return this.findBySessionId(filters.sessionId, filters);
    }

    try {
      const { data, error } = await this.client
        .from('attendees')
        .select('*')
        .order('joined_at', { ascending: false });

      if (error) throw error;

      return data.map(attendee => new Attendee(attendee));
    } catch (error) {
      this.logger.error('Error finding all attendees', error);
      throw new RepositoryError('Failed to find attendees', error);
    }
  }
}

export default AttendeeRepository;