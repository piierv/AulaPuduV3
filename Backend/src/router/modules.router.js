const express = require('express');
const router = express.Router();
const ctrl = require('../controlers/modules.controller');
const { requireAuth } = require('../middleware/requireAuth');

router.get('/', requireAuth, ctrl.listMyModules);

module.exports = router;
