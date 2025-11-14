const express = require('express');
const router = express.Router();
const ctrl = require('../controlers/attendees.controller');
const { requireAuth } = require('../middleware/requireAuth');

// Presentador ve asistentes
router.get('/session/:sessionId', requireAuth, ctrl.listBySession);

// Espectador/usuario se une (requiere token si quieres saber su id)
router.post('/join', requireAuth, ctrl.join);

module.exports = router;
