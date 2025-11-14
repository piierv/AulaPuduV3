// src/controlers/session.controller.js
const Sessions = require('../model/sessions.model');

// POST /api/sessions
async function create(req, res) {
  try {
    const { presentation_id, session_type } = req.body || {};
    const presenter_id = req.user.id; // ⚠️ viene del JWT

    const s = await Sessions.createSession({
      presenter_id,
      presentation_id,
      session_type: session_type || 'live',
    });

    return res.status(201).json(s);
  } catch (err) {
    console.error('Error en create session:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

// GET /api/sessions/my-active
async function myActiveSession(req, res) {
  try {
    const presenter_id = req.user.id;
    const s = await Sessions.getActiveByPresenter(presenter_id);
    if (!s) return res.json(null);
    return res.json(s);
  } catch (err) {
    console.error('Error en myActiveSession:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

// GET /api/sessions/by-presentation/:id
async function listByPresentation(req, res) {
  try {
    const list = await Sessions.listByPresentation(req.params.id);
    return res.json(list);
  } catch (err) {
    console.error('Error en listByPresentation:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

// GET /api/sessions/:code  (público para espectadores)
async function getByCode(req, res) {
  try {
    const s = await Sessions.getByCode(req.params.code);
    if (!s) return res.status(404).json({ error: 'Sesión no encontrada' });
    return res.json(s);
  } catch (err) {
    console.error('Error en getByCode:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

// POST /api/sessions/:code/close
async function close(req, res) {
  try {
    const s = await Sessions.closeByCode(req.params.code);
    if (!s) return res.status(404).json({ error: 'Sesión no encontrada' });
    return res.json(s);
  } catch (err) {
    console.error('Error en close session:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = {
  create,
  myActiveSession,
  listByPresentation,
  getByCode,
  close,
};
