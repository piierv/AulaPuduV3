const express = require('express');
const router = express.Router();
const ctrl = require('../controlers/activities.controller');
const { requireAuth } = require('../middleware/requireAuth');

// El presentador maneja sus actividades
router.get('/session/:sessionId', requireAuth, ctrl.listBySession);
router.post('/', requireAuth, ctrl.create);

module.exports = router;
