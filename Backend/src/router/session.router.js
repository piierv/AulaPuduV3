// src/router/session.router.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controlers/sessions.controller');
const { requireAuth } = require('../middleware/requireAuth');

// Crea una nueva sesión (presentador logueado)
router.post('/', requireAuth, ctrl.create);

// Devuelve la sesión activa del presentador
router.get('/my-active', requireAuth, ctrl.myActiveSession);

// Historial por presentación (opcional)
router.get('/by-presentation/:id', requireAuth, ctrl.listByPresentation);

// Para espectadores
router.get('/:code', ctrl.getByCode);

// Cerrar sesión por código (presentador logueado)
router.post('/:code/close', requireAuth, ctrl.close);

module.exports = router;
