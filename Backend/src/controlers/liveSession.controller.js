// Backend/src/controlers/liveSession.controller.js
const { pool } = require("../data/data");

// 🔧 Generar código tipo AULAPUDU-12345
function generateQrCode() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `AULAPUDU-${num}`;
}

/**
 * POST /api/live-session/new   (presentador)
 * Crea una sesión en la tabla sessions para que los alumnos se puedan unir.
 */
async function createLiveSession(req, res) {
  try {
    const qrCode = generateQrCode();

    // Inserta una fila mínima en "sessions"
    const result = await pool.query(
      `
      INSERT INTO sessions (
        presentation_id,
        qr_code,
        session_type,
        is_active,
        start_time,
        attendee_count
      )
      VALUES (
        NULL,
        $1,
        'live',
        TRUE,
        NOW(),
        0
      )
      RETURNING id, qr_code, session_type, is_active, start_time, attendee_count;
    `,
      [qrCode]
    );

    return res.json({ session: result.rows[0] });
  } catch (err) {
    console.error("Error al crear sesión en vivo:", err);
    return res
      .status(500)
      .json({ msg: "Error interno al crear la sesión en vivo" });
  }
}

/**
 * GET /api/sessions/:code  (alumnos)
 * Busca una sesión activa por código AULAPUDU-XXXXX
 */
async function getSessionByCode(req, res) {
  try {
    const { code } = req.params;

    const result = await pool.query(
      `
      SELECT
        id,
        qr_code,
        session_type,
        is_active,
        start_time,
        end_time,
        attendee_count
      FROM sessions
      WHERE qr_code = $1
      LIMIT 1;
    `,
      [code]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ msg: "Sesión no encontrada o ya finalizada" });
    }

    const session = result.rows[0];

    if (!session.is_active) {
      return res
        .status(410)
        .json({ msg: "La sesión ya fue finalizada por el presentador" });
    }

    return res.json({ session });
  } catch (err) {
    console.error("Error al obtener sesión por código:", err);
    return res.status(500).json({ msg: "Error interno" });
  }
}

/**
 * POST /api/live-session/end   (presentador)
 * Marca la sesión como finalizada.
 * Nosotros la identificaremos por el código (qr_code) que viene en el body.
 */
async function endLiveSession(req, res) {
  try {
    const { code } = req.body; // AULAPUDU-XXXXX

    if (!code) {
      return res.status(400).json({ msg: "Falta el código de sesión" });
    }

    const result = await pool.query(
      `
      UPDATE sessions
      SET is_active = FALSE,
          end_time = NOW()
      WHERE qr_code = $1 AND is_active = TRUE
      RETURNING id;
    `,
      [code]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ msg: "Sesión no encontrada o ya estaba finalizada" });
    }

    return res.json({ msg: "Sesión finalizada correctamente" });
  } catch (err) {
    console.error("Error al finalizar sesión:", err);
    return res.status(500).json({ msg: "Error interno al finalizar sesión" });
  }
}

module.exports = {
  createLiveSession,
  getSessionByCode,
  endLiveSession,
};
