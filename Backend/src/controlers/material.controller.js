// Backend/src/controlers/material.controller.js
const path = require("path");
const {pool} = require("../data/data"); // ajusta a tu pool/cliente

// POST /api/materials/upload
async function uploadMaterial(req, res) {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ msg: "No se adjuntó ningún archivo" });
    }

    const title =
      req.body.title ||
      path.basename(file.originalname, path.extname(file.originalname));
//db
    const description = req.body.description || null;
    const sessionId = req.body.session_id || null;
    const visibility = req.body.visibility || "session"; // 'session', 'public', 'private'

    const fileUrl = `/uploads/materials/${file.filename}`;

    const result = await pool.query(
      `
      INSERT INTO materials (
        owner_id,
        session_id,
        title,
        description,
        file_url,
        file_name,
        file_type,
        file_size,
        visibility
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      )
      RETURNING id, owner_id, title, description, file_url, file_name, file_type, file_size, visibility, created_at;
      `,
      [
        userId,
        sessionId,
        title,
        description,
        fileUrl,
        file.originalname,
        file.mimetype,
        file.size,
        visibility,
      ]
    );

    res.status(201).json({
      msg: "Material subido correctamente",
      material: result.rows[0],
    });
  } catch (err) {
    console.error("Error al subir material:", err);
    res.status(500).json({ msg: "Error interno al subir el material" });
  }
}

// GET /api/materials
async function listMyMaterials(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT id, title, description, file_url, file_name, file_type, file_size, visibility, created_at
      FROM materials
      WHERE owner_id = $1
      ORDER BY created_at DESC;
      `,
      [userId]
    );

    res.json({ materials: result.rows });
  } catch (err) {
    console.error("Error al listar materiales:", err);
    res.status(500).json({ msg: "Error interno al listar materiales" });
  }
}

// DELETE /api/materials/:id
async function deleteMaterial(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await db.query(
      `
      DELETE FROM materials
      WHERE id = $1 AND owner_id = $2
      RETURNING id;
      `,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: "Material no encontrado" });
    }

    res.json({ msg: "Material eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar material:", err);
    res.status(500).json({ msg: "Error interno al eliminar el material" });
  }
}

// GET /api/materials/session/:qrCode
// para alumnos: lista materiales visibles en una sesión activa
async function listMaterialsBySessionCode(req, res) {
  try {
    const { qrCode } = req.params;

    const sessionResult = await pool.query(
      `
      SELECT id
      FROM sessions
      WHERE qr_code = $1
        AND is_active = true;
      `,
      [qrCode]
    );

    if (sessionResult.rowCount === 0) {
      return res.status(404).json({ msg: "Sesión no encontrada o inactiva" });
    }

    const sessionId = sessionResult.rows[0].id;

    const materialsResult = await pool.query(
      `
      SELECT id, title, description, file_url, file_name, file_type, file_size, created_at
      FROM materials
      WHERE session_id = $1
        AND visibility IN ('session', 'public')
      ORDER BY created_at DESC;
      `,
      [sessionId]
    );

    res.json({ materials: materialsResult.rows });
  } catch (err) {
    console.error("Error al listar materiales por sesión:", err);
    res.status(500).json({ msg: "Error interno al listar materiales" });
  }
}

module.exports = {
  uploadMaterial,
  listMyMaterials,
  deleteMaterial,
  listMaterialsBySessionCode,
};
