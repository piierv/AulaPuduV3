const { getSql } = require('../data/data');

async function listBySession(sessionId) {
  const sql = getSql();
  return sql/*sql*/`
    select *
    from attendees
    where session_id = ${sessionId}
    order by joined_at asc;
  `;
}

async function joinSession({ session_id, user_id, device_info }) {
  const sql = getSql();
  const rows = await sql/*sql*/`
    insert into attendees (session_id, user_id, joined_at, device_info)
    values (${session_id}, ${user_id}, now(), ${device_info})
    returning *;
  `;
  return rows[0];
}

module.exports = { listBySession, joinSession };
