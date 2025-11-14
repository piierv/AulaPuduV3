// src/router/liveSession.router.js
const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/requireAuth");

router.post("/new", requireAuth, async (req, res) => {
  try {
    const random = Math.floor(10000 + Math.random() * 90000);
    const code = `AULAPUDU-${random}`;

    // TODO opcional: guardar la sesión en BD

    res.json({ ok: true, code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, msg: "Error generando sesión" });
  }
});

module.exports = router;
