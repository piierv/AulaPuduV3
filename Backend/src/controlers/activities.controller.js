const Activities = require('../model/activities.model');

async function listBySession(req, res) {
  try {
    const list = await Activities.listBySession(req.params.sessionId);
    return res.json(list);
  } catch (err) {
    console.error('Error en listBySession (activities):', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

async function create(req, res) {
  try {
    const body = req.body || {};
    if (!body.session_id) {
      return res.status(400).json({ error: 'session_id requerido' });
    }
    const created = await Activities.createActivity(body);
    return res.status(201).json(created);
  } catch (err) {
    console.error('Error en create activity:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { listBySession, create };
