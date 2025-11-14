const { getSql } = require('../data/data');

async function listBySession(sessionId) {
  const sql = getSql();
  return sql/*sql*/`
    select id, session_id, type, question, options, correct_answer, points, time_limit, created_at
    from activities
    where session_id = ${sessionId}
    order by created_at asc;
  `;
}

async function createActivity(data) {
  const sql = getSql();
  const rows = await sql/*sql*/`
    insert into activities (session_id, type, question, options, correct_answer, points, time_limit)
    values (${data.session_id}, ${data.type}, ${data.question}, ${data.options}, ${data.correct_answer},
            ${data.points}, ${data.time_limit})
    returning *;
  `;
  return rows[0];
}

module.exports = { listBySession, createActivity };
