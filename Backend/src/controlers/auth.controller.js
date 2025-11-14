// src/app/controlers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Users = require('../model/authUser.model');

const BCRYPT_COST = Number(process.env.BCRYPT_COST || 12);
const JWT_SECRET = process.env.JWT_SECRET || 'cambia_esto';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 1000, // 1 hora
};

/**
 * POST /api/auth/register
 * Body: { full_name, email, password }
 */
async function register(req, res) {
  try {
    const { full_name, email, password } = req.body || {};

    const nameOk = String(full_name || '').trim();
    const emailOk = String(email || '').toLowerCase().trim();
    const passOk = String(password || '').trim();

    if (!nameOk) return res.status(400).json({ msg: 'full_name requerido' });
    if (!emailOk) return res.status(400).json({ msg: 'email requerido' });
    if (!passOk) return res.status(400).json({ msg: 'password requerido' });

    // ¿Ya existe ese correo?
    const exists = await Users.findByEmail(emailOk);
    if (exists) {
      return res.status(409).json({ msg: 'Correo ya registrado' });
    }

    const password_hash = await bcrypt.hash(passOk, BCRYPT_COST);

    const u = await Users.createUser({
      email: emailOk,
      full_name: nameOk,
      password_hash,
      role: 'presenter',
    });

    return res.status(201).json({
      msg: 'Usuario creado',
      user: { id: u.id, email: u.email, full_name: u.full_name, role: u.role },
    });
  } catch (err) {
    console.error('Error en register:', err);
    return res.status(500).json({ msg: 'Error interno' });
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    const emailOk = String(email || '').toLowerCase().trim();
    const passOk = String(password || '').trim();

    if (!emailOk || !passOk) {
      return res.status(400).json({ msg: 'email y password requeridos' });
    }

    const u = await Users.findByEmail(emailOk);

    if (!u || !u.password_hash) {
      return res.status(401).json({ msg: 'Credenciales inválidas' });
    }

    const ok = await bcrypt.compare(passOk, u.password_hash);
    if (!ok) {
      return res.status(401).json({ msg: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { sub: String(u.id), email: u.email, role: u.role || 'presenter' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // cookie + token en el body
    res.cookie('access_token', token, COOKIE_OPTS);

    return res.json({
      msg: 'Login ok',
      token,
      user: {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
      },
    });
  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ msg: 'Error interno' });
  }
}

/**
 * GET /api/auth/me
 */
async function me(req, res) {
  try {
    const u = await Users.findById(req.user.id);
    if (!u) return res.status(404).json({ msg: 'Usuario no encontrado' });

    return res.json({
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role: u.role,
    });
  } catch (err) {
    console.error('Error en me:', err);
    return res.status(500).json({ msg: 'Error interno' });
  }
}

/**
 * POST /api/auth/logout
 */
async function logout(_req, res) {
  res.clearCookie('access_token', COOKIE_OPTS);
  return res.json({ msg: 'Logout ok' });
}

module.exports = { register, login, me, logout };
