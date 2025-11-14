// src/pages/dashboard/Presentations.jsx
import { useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import { apiFetch } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

// URL base del backend (sin /api)
const API_BASE_URL = "http://localhost:4000";

export default function Presentations() {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [customTitle, setCustomTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [presentations, setPresentations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  // Cargar lista de presentaciones al entrar
  const loadPresentations = async () => {
    try {
      setLoadingList(true);
      setError("");

      // /api/presentations → el apiFetch ya agrega la base /api
      const res = await apiFetch("/presentations");
      setPresentations(res.presentations || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al cargar las presentaciones");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadPresentations();
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
      if (customTitle.trim()) {
        formData.append("title", customTitle.trim());
      }

      // Usamos siempre la misma base URL
      const res = await fetch(`${API_BASE_URL}/api/presentations/upload`, {
        method: "POST",
        headers: {
          // NO ponemos Content-Type, fetch lo arma solo (boundary)
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || "Error al subir presentación");
      }

      // Limpiar formulario y recargar lista
      setFile(null);
      setCustomTitle("");
      if (e.target.reset) e.target.reset();
      await loadPresentations();
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al subir la presentación");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta presentación?")) return;

    try {
      await apiFetch(`/presentations/${id}`, {
        method: "DELETE",
      });
      setPresentations((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message || "Error al eliminar la presentación");
    }
  };

  return (
    <div className="ap-dashboard-section">
      <h2 className="ap-section-title">Mis Presentaciones</h2>

      <div className="ap-stack">
        {/* Subir nueva presentación */}
        <Card
          title="Subir Nueva Presentación"
          accent="neutral"
          footer={
            <button
              className="ap-btn ap-btn-small ap-btn-outline"
              type="submit"
              form="upload-presentation-form"
              disabled={uploading}
            >
              {uploading ? "Subiendo..." : "Subir Presentación"}
            </button>
          }
        >
          <p>
            Formatos soportados: PDF, PowerPoint (PPT/PPTX), Word (DOCX),
            imágenes.
          </p>

          <form
            id="upload-presentation-form"
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
                placeholder="Título opcional de la presentación"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </div>

            {error && <div className="ap-error-text">{error}</div>}
          </form>
        </Card>

        {/* Presentaciones disponibles */}
        <Card title="Presentaciones Disponibles" accent="green">
          {loadingList ? (
            <p>Cargando presentaciones...</p>
          ) : presentations.length === 0 ? (
            <p>No tienes presentaciones subidas aún.</p>
          ) : (
            <ul className="ap-list">
              {presentations.map((p) => (
                <li key={p.id} className="ap-list-item">
                  <div className="ap-list-main">
                    <strong>{p.title}</strong>
                    {p.file_name && (
                      <span className="ap-list-sub">
                        {p.file_name} (
                        {Math.round((p.file_size || 0) / 1024)} KB)
                      </span>
                    )}
                  </div>

                  <div className="ap-list-actions">
                    {p.file_url && (
                      <a
                        className="ap-link"
                        href={`${API_BASE_URL}${p.file_url}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver / Descargar
                      </a>
                    )}
                    <button
                      className="ap-btn ap-btn-small ap-btn-outline"
                      type="button"
                      onClick={() => handleDelete(p.id)}
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
