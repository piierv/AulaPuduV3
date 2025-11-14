// src/pages/dashboard/Materials.jsx
import { useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import { apiFetch } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

// URL base del backend (sin /api)
const API_BASE_URL = "http://localhost:4000";

// Helper: tipos que normalmente el navegador puede previsualizar
const isPreviewable = (mime) =>
  mime?.startsWith("image/") || mime === "application/pdf";

export default function Materials() {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [materials, setMaterials] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const loadMaterials = async () => {
    try {
      setLoadingList(true);
      setError("");
      const res = await apiFetch("/materials");
      setMaterials(res.materials || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar los materiales");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Selecciona un archivo primero");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      if (title.trim()) formData.append("title", title.trim());
      if (desc.trim()) formData.append("description", desc.trim());
      // opcional: session_id, visibility...

      const res = await fetch(`${API_BASE_URL}/api/materials/upload`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || "Error al subir material");
      }

      setFile(null);
      setTitle("");
      setDesc("");
      if (e.target.reset) e.target.reset();
      await loadMaterials();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al subir el material");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este material?")) return;

    try {
      await apiFetch(`/materials/${id}`, {
        method: "DELETE",
      });
      setMaterials((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al eliminar el material");
    }
  };

  return (
    <div className="ap-dashboard-section">
      <h2 className="ap-section-title">Materiales del Curso</h2>

      <div className="ap-stack">
        {/* Subir nuevo material */}
        <Card
          title="Subir Nuevo Material"
          accent="neutral"
          footer={
            <button
              className="ap-btn ap-btn-small ap-btn-outline"
              type="submit"
              form="upload-material-form"
              disabled={uploading}
            >
              {uploading ? "Subiendo..." : "Subir Material"}
            </button>
          }
        >
          <p>Formatos soportados: PDF, DOCX, PPTX, imágenes.</p>

          <form
            id="upload-material-form"
            onSubmit={handleUpload}
            className="ap-upload-form"
          >
            <div className="ap-upload-row">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="ap-upload-row">
              <input
                type="text"
                className="ap-input"
                placeholder="Título del material"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="ap-upload-row">
              <textarea
                className="ap-input"
                placeholder="Descripción breve (opcional)"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={2}
              />
            </div>

            {error && <div className="ap-error-text">{error}</div>}
          </form>
        </Card>

        {/* Material disponible */}
        <Card title="Material de Estudio Disponible" accent="green">
          {loadingList ? (
            <p>Cargando materiales...</p>
          ) : materials.length === 0 ? (
            <p>No hay materiales subidos aún.</p>
          ) : (
            <ul className="ap-list">
              {materials.map((m) => (
                <li key={m.id} className="ap-list-item">
                  <div className="ap-list-main">
                    <strong>{m.title}</strong>
                    {m.description && (
                      <span className="ap-list-sub">{m.description}</span>
                    )}
                    {m.file_name && (
                      <span className="ap-list-sub">
                        {m.file_name} (
                        {Math.round((m.file_size || 0) / 1024)} KB)
                      </span>
                    )}
                  </div>

                  <div className="ap-list-actions">
                    {m.file_url && (
                      <a
                        className="ap-link"
                        href={`${API_BASE_URL}${m.file_url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {isPreviewable(m.file_type)
                          ? "Ver (vista previa)"
                          : "Descargar"}
                      </a>
                    )}
                    <button
                      className="ap-btn ap-btn-small ap-btn-outline"
                      type="button"
                      onClick={() => handleDelete(m.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
