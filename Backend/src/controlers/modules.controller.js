const Modules = require('../model/modules.model');

async function listMyModules(req, res) {
  try {
    const list = await Modules.listByUser(req.user.id);
    return res.json(list);
  } catch (err) {
    console.error('Error en listMyModules:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { listMyModules };
