const express = require('express');
const router = express.Router();
const ctrl = require('../controlers/presentation.controller');
const { requireAuth } = require('../middleware/requireAuth');
const {createUpload}=require("../utils/upload")
const {uploadPresentation,listMyPresentations,deletePresentation,streamPdf}=require("../controlers/presentation.controller")


// Todas las rutas de presentaciones requieren que el usuario esté logueado
const uploadPresentationMiddleware = createUpload("presentations");

// Lista las presentaciones del presentador logueado
router.get("/", requireAuth, listMyPresentations);

// Subir nueva presentación (campo form-data: "file")
router.post(
  "/upload",
  requireAuth,
  uploadPresentationMiddleware.single("file"),
  uploadPresentation
);

// Eliminar una presentación propia
router.delete("/:id", requireAuth, deletePresentation);
router.get('/:id/pdf',streamPdf);
module.exports = router;