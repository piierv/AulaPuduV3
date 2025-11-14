// src/data/data.js
const postgres = require('postgres');
require('dotenv').config();
const { Pool } = require('pg');
let sql; // cliente global

function cleanUrl(u) {
  return (u || '')
    .replace(/\r|\n|\t|\u200B|\u200C|\u200D/g, '')
    .trim()
    .replace(/^postgresql:\/\//i, 'postgres://');
}

async function dbConexion() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error('DATABASE_URL no definida en .env');

  const url = cleanUrl(raw);
  console.log('Intentando conectar a:', url.replace(/:[^@]+@/, ':***@'));

  sql = postgres(url, { ssl: 'require' }); // Supabase exige SSL

  await sql`select 1 as ok`;
  console.log('✅ Conectado a Supabase');
  return sql;
}

function getSql() {
  if (!sql) throw new Error('DB no inicializada, llama a dbConexion() primero');
  return sql;
}
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// 👇 exportamos TODO en CommonJS
module.exports = {
  dbConexion,
  getSql,
  pool,
};