const Attendees = require('../model/attendees.model');

async function listBySession(req, res) {
  try {
    const list = await Attendees.listBySession(req.params.sessionId);
    return res.json(list);
  } catch (err) {
    console.error('Error en listBySession (attendees):', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

// Un espectador se "une" a la sesión
async function join(req, res) {
  try {
    const body = req.body || {};
    if (!body.session_id) return res.status(400).json({ error: 'session_id requerido' });

    const user_id = req.user ? req.user.id : body.user_id;
    const device_info = body.device_info || {};

    const created = await Attendees.joinSession({ session_id: body.session_id, user_id, device_info });
    return res.status(201).json(created);
  } catch (err) {
    console.error('Error en join (attendees):', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { listBySession, join };
