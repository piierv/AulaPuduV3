const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/requireAuth');
const {createUpload} = require("../utils/upload")
const {uploadMaterial,listMyMaterials,listMaterialsBySessionCode,deleteMaterial}=require("../controlers/material.controller")

const uploadMaterialMiddleware = createUpload("materials");

router.get("/", requireAuth, listMyMaterials);

// Subir material para alumnos
router.post(
  "/upload",
  requireAuth,
  uploadMaterialMiddleware.single("file"),
  uploadMaterial
);

// Eliminar material propio
router.delete("/:id", requireAuth, deleteMaterial);

// (Opcional) Materiales visibles por código de sesión (para alumnos)
router.get("/session/:qrCode", listMaterialsBySessionCode);


module.exports = router;
