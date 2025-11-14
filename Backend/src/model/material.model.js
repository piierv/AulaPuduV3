const { pool } = require('../data/data');

async function createMaterial({ title, fileUrl, fileType }) {
  const query = `
    INSERT INTO materials (title, file_url, file_type)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [title, fileUrl, fileType];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function getAllMaterials() {
  const query = `
    SELECT id, title, file_url, file_type, created_at
    FROM materials
    ORDER BY created_at DESC;
  `;
  const { rows } = await pool.query(query);
  return rows;
}

module.exports = {
  createMaterial,
  getAllMaterials,
};
