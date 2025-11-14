const Plugins = require('../model/plugins.model');

async function list(req, res) {
  try {
    const list = await Plugins.listPlugins();
    return res.json(list);
  } catch (err) {
    console.error('Error en list plugins:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = { list };
