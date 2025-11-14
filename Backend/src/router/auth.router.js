// src/app/router/auth.router.js
const express = require('express');
const router = express.Router();
const {login,register,me,logout}= require('../controlers/auth.controller');
const { requireAuth } = require('../middleware/requireAuth');

// Registro y login públicos
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas (requieren JWT válido)
// Rutas protegidas (requieren JWT válido)
router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);


module.exports = router;
