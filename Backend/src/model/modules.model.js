const { getSql } = require('../data/data');

async function listByUser(userId) {
  const sql = getSql();
  return sql/*sql*/`
    select *
    from module_configurations
    where user_id = ${userId}
    order by created_at desc;
  `;
}

module.exports = { listByUser };
