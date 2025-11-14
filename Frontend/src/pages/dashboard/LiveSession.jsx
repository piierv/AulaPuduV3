// src/pages/dashboard/LiveSession.jsx
import { useEffect, useState } from "react";
import Card from "../../components/Card.jsx";
import { apiFetch } from "../../services/api.js";

const SESSION_KEY = "aulaPudu_liveSession";

export default function LiveSession() {
  const [session, setSession] = useState(null);
  const [presentations, setPresentations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [currentSlide, setCurrentSlide] = useState(1);
  const [error, setError] = useState("");
  const [loadingPres, setLoadingPres] = useState(true);

  // Cargar sesión activa desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        const s = JSON.parse(stored);
        setSession(s);
      }
    } catch {
      // ignore
    }
  }, []);

  // Cargar lista de presentaciones disponibles
  useEffect(() => {
    async function loadPresentations() {
      try {
        setLoadingPres(true);
        setError("");
        const res = await apiFetch("/presentations");
        setPresentations(res.presentations || []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Error al cargar las presentaciones.");
      } finally {
        setLoadingPres(false);
      }
    }

    loadPresentations();
  }, []);

  // Enlazar presentación seleccionada a la sesión (solo lado frontend)
  const handleUsePresentation = () => {
    if (!selectedId) {
      alert("Selecciona primero una presentación.");
      return;
    }

    const pres = presentations.find((p) => p.id === selectedId);
    if (!pres) return;

    const updatedSession = {
      ...session,
      presentation_id: pres.id,
      presentation_title: pres.title,
      presentation_file_url: pres.file_url,
    };

    setSession(updatedSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => Math.max(1, prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  if (!session) {
    return (
      <div className="ap-dashboard-section">
        <h2 className="ap-section-title">Control de Sesión en Vivo</h2>
        <p>
          No hay sesión activa. Genera un código QR desde el Resumen del
          Dashboard para iniciar una sesión en vivo.
        </p>
      </div>
    );
  }

  const currentPresentation = presentations.find(
    (p) => p.id === session.presentation_id
  );

  return (
    <div className="ap-dashboard-section">
      <h2 className="ap-section-title">Control de Sesión en Vivo</h2>

      <p className="ap-session-info">
        Sesión actual: <strong>{session.qr_code}</strong>
      </p>

      <div className="ap-reactions-bar">
        <span>❤️ 0</span>
        <span>👏 0</span>
        <span>❓ 0</span>
        <span>👍 0</span>
        <span>👎 0</span>
      </div>

      <div className="ap-timer-bar">
        <div className="ap-timer-display">00:00:00</div>
        <button className="ap-btn ap-btn-small ap-btn-outline">
          Iniciar Timer
        </button>
        <button className="ap-btn ap-btn-small ap-btn-outline">
          Reiniciar
        </button>
      </div>

      {/* Selección de presentación */}
      <Card title="Seleccionar Presentación para la Sesión">
        {error && <div className="ap-error-text">{error}</div>}

        {loadingPres ? (
          <p>Cargando presentaciones...</p>
        ) : presentations.length === 0 ? (
          <p>
            No tienes presentaciones subidas. Ve a la sección{" "}
            <strong>Presentaciones</strong> para subir una.
          </p>
        ) : (
          <>
            <label className="ap-label">
              Presentación:
              <select
                className="ap-input"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">-- Selecciona una presentación --</option>
                {presentations.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title || p.file_name}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="ap-btn ap-btn-small ap-btn-outline"
              type="button"
              onClick={handleUsePresentation}
            >
              Usar en Sesión
            </button>

            {currentPresentation && (
              <p className="ap-session-info">
                Presentando: <strong>{currentPresentation.title}</strong>
              </p>
            )}
          </>
        )}
      </Card>

      {/* Vista de diapositiva actual (muy simple por ahora) */}
      <Card
        title={`Diapositiva ${currentSlide}`}
        accent={currentPresentation ? "green" : "neutral"}
      >
        {currentPresentation ? (
          <>
            <p>Previsualizando: {currentPresentation.file_name}</p>
            {currentPresentation.file_url && (
              <iframe
                title="Presentación"
                src={`http://localhost:4000${currentPresentation.file_url}`}
                className="ap-slide-iframe"
              />
            )}
          </>
        ) : (
          <p>Carga una presentación y márcala como activa para previsualizar.</p>
        )}

        <div className="ap-slide-controls">
          <button
            className="ap-btn ap-btn-small ap-btn-outline"
            type="button"
            onClick={handlePrevSlide}
          >
            Diapositiva Anterior
          </button>
          <button
            className="ap-btn ap-btn-small ap-btn-outline"
            type="button"
            onClick={handleNextSlide}
          >
            Siguiente Diapositiva
          </button>
          <button
            className="ap-btn ap-btn-small ap-btn-outline"
            type="button"
            onClick={() => setCurrentSlide(1)}
          >
            Finalizar Presentación
          </button>
          <button className="ap-btn ap-btn-small ap-btn-outline">
            Modelo 3D (Demo)
          </button>
        </div>
      </Card>
    </div>
  );
}
