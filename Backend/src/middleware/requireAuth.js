// src/app/middleware/requireAuth.js
const jwt = require('jsonwebtoken');

/**
 * Lee el token desde:
 * - Authorization: Bearer <token>
 * - o cookie access_token
 * Verifica el JWT con JWT_SECRET
 */
function requireAuth(req, res, next) {
  try {
    let token = null;

    // 1) Intentamos por header Authorization
    const auth = req.headers.authorization || '';
    if (auth.startsWith('Bearer ')) {
      token = auth.slice(7);
    }

    // 2) Si no viene, probamos cookie
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return res.status(401).json({ msg: 'Falta token de autenticación' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ msg: 'JWT_SECRET no configurado en .env' });
    }

    const payload = jwt.verify(token, secret);

    // Guardamos datos mínimos en req.user
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role || 'presenter',
    };

    next();
  } catch (err) {
    console.error('Error en requireAuth:', err.message);
    return res.status(401).json({ msg: 'Token inválido o expirado' });
  }
}

module.exports = { requireAuth };
