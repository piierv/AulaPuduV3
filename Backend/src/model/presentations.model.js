const { getSql } = require('../data/data');

// Lista presentaciones del presentador actual
async function listByPresenter(presenterId) {
  const sql = getSql();
  return sql/*sql*/`
    select id, presenter_id, title, content, media_type, settings, created_at, updated_at
    from presentations
    where presenter_id = ${presenterId}
    order by created_at desc;
  `;
}

// Crea una nueva presentación
async function createPresentation({ presenter_id, title, content, media_type, settings }) {
  const sql = getSql();
  const rows = await sql/*sql*/`
    insert into presentations (presenter_id, title, content, media_type, settings)
    values (${presenter_id}, ${title}, ${content}, ${media_type}, ${settings})
    returning id, presenter_id, title, content, media_type, settings, created_at, updated_at;
  `;
  return rows[0];
}

async function getById(id) {
  const sql = getSql();
  const rows = await sql/*sql*/`
    select id, presenter_id, title, content, media_type, settings, created_at, updated_at
    from presentations
    where id = ${id}
    limit 1;
  `;
  return rows[0] || null;
}

async function updatePresentation(id, { title, content, media_type, settings }) {
  const sql = getSql();
  const rows = await sql/*sql*/`
    update presentations
    set title      = coalesce(${title}, title),
        content    = coalesce(${content}, content),
        media_type = coalesce(${media_type}, media_type),
        settings   = coalesce(${settings}, settings),
        updated_at = now()
    where id = ${id}
    returning id, presenter_id, title, content, media_type, settings, created_at, updated_at;
  `;
  return rows[0] || null;
}

async function deletePresentation(id) {
  const sql = getSql();
  await sql/*sql*/`delete from presentations where id = ${id};`;
}

module.exports = {
  listByPresenter,
  createPresentation,
  getById,
  updatePresentation,
  deletePresentation,
};
