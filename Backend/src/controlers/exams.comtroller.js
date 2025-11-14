const Exams = require('../model/exams.model');
const Results = require('../model/exam_results.model');

async function listBySession(req, res) {
  try {
    const list = await Exams.listBySession(req.params.sessionId);
    return res.json(list);
  } catch (err) {
    console.error('Error en listBySession (exams):', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

async function createExam(req, res) {
  try {
    const body = req.body || {};
    if (!body.session_id) return res.status(400).json({ error: 'session_id requerido' });
    const created = await Exams.createExam(body);
    return res.status(201).json(created);
  } catch (err) {
    console.error('Error en createExam:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

async function listResults(req, res) {
  try {
    const list = await Results.listByExam(req.params.examId);
    return res.json(list);
  } catch (err) {
    console.error('Error en listResults:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

async function submitResult(req, res) {
  try {
    const body = req.body || {};
    if (!body.exam_id) return res.status(400).json({ error: 'exam_id requerido' });

    // si viene de un user logueado, usamos req.user.id como user_id
    const user_id = req.user ? req.user.id : body.user_id;

    const created = await Results.createResult({
      ...body,
      user_id,
      completed_at: body.completed_at || new Date(),
    });
    return res.status(201).json(created);
  } catch (err) {
    console.error('Error en submitResult:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { listBySession, createExam, listResults, submitResult };
