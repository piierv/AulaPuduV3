const { getSql } = require('../data/data');

async function listByPresentation(presentationId) {
  const sql = getSql();
  return sql/*sql*/`
    select *
    from three_d_models
    where presentation_id = ${presentationId}
    order by created_at desc;
  `;
}

module.exports = { listByPresentation };
