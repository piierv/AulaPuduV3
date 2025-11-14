// src/utils/validation.js

/**
 * Valida paginación simple (page, pageSize) para listados.
 */
function parsePagination(query) {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(query.pageSize || '20', 10), 1), 100);
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset };
}

module.exports = { parsePagination };
