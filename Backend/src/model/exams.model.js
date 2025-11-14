const { getSql } = require('../data/data');

async function listBySession(sessionId) {
  const sql = getSql();
  return sql/*sql*/`
    select *
    from exams
    where session_id = ${sessionId}
    order by created_at desc;
  `;
}

async function createExam(data) {
  const sql = getSql();
  const rows = await sql/*sql*/`
    insert into exams (session_id, title, questions, total_points, time_limit, is_active, settings)
    values (${data.session_id}, ${data.title}, ${data.questions}, ${data.total_points},
            ${data.time_limit}, ${data.is_active}, ${data.settings})
    returning *;
  `;
  return rows[0];
}

module.exports = { listBySession, createExam };
