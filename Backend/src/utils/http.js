function ok(res, data) { return res.json(data); }
function created(res, data) { return res.status(201).json(data); }
function badRequest(res, msg) { return res.status(400).json({ error: msg }); }
function notFound(res, msg='Not found') { return res.status(404).json({ error: msg }); }
function serverError(res, err) { console.error(err); return res.status(500).json({ error: 'Internal Server Error' }); }
module.exports = { ok, created, badRequest, notFound, serverError };
