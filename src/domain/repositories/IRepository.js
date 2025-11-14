/**
 * AULAPUDU 2.0 - REPOSITORY INTERFACE
 * Interfaz base para repositorios (contrato)
 */

export class IRepository {
  async findById(id) {
    throw new Error('Method findById must be implemented');
  }

  async findAll(filters = {}) {
    throw new Error('Method findAll must be implemented');
  }

  async save(entity) {
    throw new Error('Method save must be implemented');
  }

  async update(entity) {
    throw new Error('Method update must be implemented');
  }

  async delete(id) {
    throw new Error('Method delete must be implemented');
  }
}

export default IRepository;