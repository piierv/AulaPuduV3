const express = require('express');
const router = express.Router();
const ctrl = require('../controlers/models3d.controller');
const { requireAuth } = require('../middleware/requireAuth');

router.get('/presentation/:presentationId', requireAuth, ctrl.listByPresentation);

module.exports = router;
