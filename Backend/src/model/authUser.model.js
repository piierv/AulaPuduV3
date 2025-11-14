// src/model/authUser.model.js
const { getSql } = require('../data/data');

/**
 * Busca usuario por email en tabla public.users
 */
async function findByEmail(email) {
  const sql = getSql();
  const rows = await sql/*sql*/`
    select id, email, full_name, role, password_hash, created_at, updated_at
    from public.users
    where email = ${email}
    limit 1;
  `;
  return rows[0] || null;
}

/**
 * Busca usuario por id
 */
async function findById(id) {
  const sql = getSql();
  const rows = await sql/*sql*/`
    select id, email, full_name, role, created_at, updated_at
    from public.users
    where id = ${id}
    limit 1;
  `;
  return rows[0] || null;
}

/**
 * Crea usuario nuevo
 */
async function createUser({ email, full_name, password_hash, role }) {
  const sql = getSql();
  const rows = await sql/*sql*/`
    insert into public.users (email, full_name, password_hash, role)
    values (${email}, ${full_name}, ${password_hash}, ${role || 'presenter'})
    returning id, email, full_name, role, created_at, updated_at;
  `;
  return rows[0];
}

module.exports = {
  findByEmail,
  findById,
  createUser,
};
