const Models3D = require('../model/models3d.model');

async function listByPresentation(req, res) {
  try {
    const list = await Models3D.listByPresentation(req.params.presentationId);
    return res.json(list);
  } catch (err) {
    console.error('Error en listByPresentation (3d):', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { listByPresentation };
