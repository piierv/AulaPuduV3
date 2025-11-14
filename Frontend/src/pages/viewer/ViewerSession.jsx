// src/pages/viewer/ViewerSession.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../../services/api";

export default function ViewerSession() {
  const { code } = useParams(); // AULAPUDU-XXXX
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Opcional: datos guardados en localStorage (nombre del espectador)
  const viewerInfo = (() => {
    try {
      return JSON.parse(localStorage.getItem("aulaPudu_viewer") || "{}");
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const s = await apiFetch(`/sessions/${encodeURIComponent(code)}`);
        setSession(s);

        // 👇 aquí más adelante podrías abrir WebSocket / SSE para sincronizar diapositivas
      } catch (err) {
        console.error(err);
        setError(err.message || "No se pudo cargar la sesión.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [code]);

  if (loading) return <p>Cargando sesión...</p>;
  if (error) return <p className="ap-error-text">{error}</p>;
  if (!session) return <p>Sesión no encontrada.</p>;

  return (
    <div className="ap-viewer-session">
      <header className="ap-viewer-header">
        <h2>{session.title || "Sesión en Vivo"}</h2>
        <span className="ap-viewer-sub">
          ID: {session.code} • Tú: {viewerInfo.name || "Invitado"}
        </span>
      </header>

      <main className="ap-viewer-main">
        {/* Simple: mostrar la presentación asociada si tienes file_url */}
        {session.presentation?.file_url ? (
          <iframe
            title="Presentación"
            src={`http://localhost:4000${session.presentation.file_url}`}
            className="ap-slide-iframe"
          />
        ) : (
          <p>El presentador aún no ha cargado una presentación.</p>
        )}
      </main>
    </div>
  );
}
