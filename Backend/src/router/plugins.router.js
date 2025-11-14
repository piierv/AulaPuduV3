const express = require('express');
const router = express.Router();
const ctrl = require('../controlers/plugins.controller');
const { requireAuth } = require('../middleware/requireAuth');

// Solo usuarios logueados consultan plugins
router.get('/', requireAuth, ctrl.list);

module.exports = router;
