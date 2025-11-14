const { getSql } = require('../data/data');

async function listByExam(examId) {
  const sql = getSql();
  return sql/*sql*/`
    select *
    from exam_results
    where exam_id = ${examId}
    order by completed_at desc;
  `;
}

async function createResult(data) {
  const sql = getSql();
  const rows = await sql/*sql*/`
    insert into exam_results (exam_id, user_id, score, answers, completed_at, time_spent)
    values (${data.exam_id}, ${data.user_id}, ${data.score}, ${data.answers},
            ${data.completed_at}, ${data.time_spent})
    returning *;
  `;
  return rows[0];
}

module.exports = { listByExam, createResult };
