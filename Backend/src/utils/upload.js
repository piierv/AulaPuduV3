// Backend/src/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

function createUpload(subfolder) {
  // 🔹 Carpeta raíz de uploads: Backend/src/uploads
  const baseDir = path.join(__dirname, "..", "uploads", subfolder);

  // Crear carpeta si no existe
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, baseDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext);
      const safeBase = base.replace(/\s+/g, "_").toLowerCase();
      cb(null, `${Date.now()}-${safeBase}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];

    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no soportado"), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50 MB
    },
  });
}

module.exports = { createUpload };
