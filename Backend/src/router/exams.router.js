const express = require('express');
const router = express.Router();
const ctrl = require('../controlers/exams.comtroller');
const { requireAuth } = require('../middleware/requireAuth');

// Admin / presentador
router.get('/session/:sessionId', requireAuth, ctrl.listBySession);
router.post('/', requireAuth, ctrl.createExam);
router.get('/:examId/results', requireAuth, ctrl.listResults);

// Participante (requiere estar logueado igual)
router.post('/:examId/submit', requireAuth, ctrl.submitResult);

module.exports = router;
