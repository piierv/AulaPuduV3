// src/model/sessions.model.js
const { pool } = require('../data/data');
const { randomInt } = require('crypto');

function generateCode() {
  const n = randomInt(10000, 99999);
  return `AULAPUDU-${n}`;
}

async function createSession({ presenter_id, presentation_id = null, session_type = 'live' }) {
  // Opcional: desactivar otras sesiones activas del mismo presentador
  await pool.query(
    `UPDATE sessions SET is_active = false, end_time = NOW()
     WHERE presenter_id = $1 AND is_active = true`,
    [presenter_id]
  );

  const qr_code = generateCode();

  const result = await pool.query(
    `INSERT INTO sessions (
       presenter_id,
       presentation_id,
       qr_code,
       session_type,
       is_active,
       start_time
     )
     VALUES ($1, $2, $3, $4, true, NOW())
     RETURNING *`,
    [presenter_id, presentation_id, qr_code, session_type]
  );

  return result.rows[0];
}

async function getActiveByPresenter(presenter_id) {
  const result = await pool.query(
    `SELECT * FROM sessions
     WHERE presenter_id = $1 AND is_active = true
     ORDER BY start_time DESC
     LIMIT 1`,
    [presenter_id]
  );
  return result.rows[0] || null;
}

async function getByCode(code) {
  const result = await pool.query(
    `SELECT * FROM sessions
     WHERE qr_code = $1 AND is_active = true
     LIMIT 1`,
    [code]
  );
  return result.rows[0] || null;
}

async function closeByCode(code) {
  const result = await pool.query(
    `UPDATE sessions
     SET is_active = false, end_time = NOW()
     WHERE qr_code = $1 AND is_active = true
     RETURNING *`,
    [code]
  );
  return result.rows[0] || null;
}

async function listByPresentation(presentation_id) {
  const result = await pool.query(
    `SELECT * FROM sessions
     WHERE presentation_id = $1
     ORDER BY start_time DESC`,
    [presentation_id]
  );
  return result.rows;
}

module.exports = {
  createSession,
  getActiveByPresenter,
  getByCode,
  closeByCode,
  listByPresentation,
};
