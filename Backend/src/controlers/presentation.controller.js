// Backend/src/controlers/presentation.controller.js
const path = require("path");
// Ajusta este require a tu pool/cliente de Postgres
const {pool} = require("../data/data"); 



// POST /api/presentations/upload
async function uploadPresentation(req, res) {
  try {
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ msg: "No se adjuntó ningún archivo" });
    }

    const title =
      req.body.title ||
      path.basename(file.originalname, path.extname(file.originalname));

    const fileUrl = `/uploads/presentations/${file.filename}`;

    const result = await pool.query(
      `
      INSERT INTO presentations (
        presenter_id,
        title,
        content,
        media_type,
        settings,
        file_url,
        file_name,
        file_type,
        file_size
      )
      VALUES (
        $1,
        $2,
        '{}'::jsonb,
        '{"kind":"presentation"}'::jsonb,
        '{}'::jsonb,
        $3,
        $4,
        $5,
        $6
      )
      RETURNING id, presenter_id, title, file_url, file_name, file_type, file_size, created_at;
      `,
      [
        userId,
        title,
        fileUrl,
        file.originalname,
        file.mimetype,
        file.size,
      ]
    );

    res.status(201).json({
      msg: "Presentación subida correctamente",
      presentation: result.rows[0],
    });
  } catch (err) {
    console.error("Error al subir presentación:", err);
    res.status(500).json({ msg: "Error interno al subir la presentación" });
  }
}

// GET /api/presentations
async function listMyPresentations(req, res) {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT id, title, file_url, file_name, file_type, file_size, created_at
      FROM presentations
      WHERE presenter_id = $1
      ORDER BY created_at DESC;
      `,
      [userId]
    );

    res.json({ presentations: result.rows });
  } catch (err) {
    console.error("Error al listar presentaciones:", err);
    res.status(500).json({ msg: "Error interno al listar presentaciones" });
  }
}

// DELETE /api/presentations/:id
async function deletePresentation(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Solo puede borrar presentaciones propias
    const result = await pool.query(
      `
      DELETE FROM presentations
      WHERE id = $1 AND presenter_id = $2
      RETURNING id;
      `,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ msg: "Presentación no encontrada" });
    }

    res.json({ msg: "Presentación eliminada correctamente" });
  } catch (err) {
    console.error("Error al eliminar presentación:", err);
    res.status(500).json({ msg: "Error interno al eliminar la presentación" });
  }
}
async function streamPdf(req, res) {
  try {
    const { id } = req.params;

    // Aquí buscas la presentación en la BD
    // y obtienes la ruta del archivo
    const presentation = await Presentations.findById(id);
    if (!presentation) {
      return res.status(404).json({ error: 'Presentación no encontrada' });
    }

    const filePath = presentation.file_path; // ruta absoluta o relativa

    // NO forzar descarga: solo indicamos que es PDF
    res.setHeader('Content-Type', 'application/pdf');
    // NO usar "Content-Disposition: attachment"
    // res.setHeader('Content-Disposition', 'inline');

    return res.sendFile(path.resolve(filePath));
  } catch (err) {
    console.error('Error al servir PDF:', err);
    return res.status(500).json({ error: 'Error al cargar la presentación' });
  }
}
module.exports = {
  uploadPresentation,
  listMyPresentations,
  deletePresentation,
  streamPdf
};
