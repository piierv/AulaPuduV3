const { getSql } = require('../data/data');

async function listPlugins() {
  const sql = getSql();
  return sql/*sql*/`
    select *
    from plugins
    order by created_at desc;
  `;
}

module.exports = { listPlugins };
