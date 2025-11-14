// src/pages/viewer/JoinViewer.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../services/api";

export default function JoinViewer() {
  const [sessionCode, setSessionCode] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const code = sessionCode.trim();
    if (!code || !name.trim()) {
      setError("Ingresa el ID de sesión y tu nombre");
      return;
    }

    try {
      setLoading(true);

      // 👇 VALIDAR CÓDIGO CONTRA TU BACKEND
      const session = await apiFetch(`/sessions/${encodeURIComponent(code)}`, {
        method: "GET",
      });

      // Si llega aquí, la sesión existe
      // Guarda datos básicos para usarlos en el aula
      localStorage.setItem(
        "aulaPudu_viewer",
        JSON.stringify({
          name: name.trim(),
          sessionCode: code,
          sessionId: session.id,
          presentationId: session.presentation_id,
        })
      );

      // Navega al "aula" del espectador
      navigate(`/viewer/session/${encodeURIComponent(code)}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo encontrar la sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-viewer-join">
      <h2 className="ap-section-title">Unirse a una Presentación</h2>

      <form className="ap-form" onSubmit={handleSubmit}>
        <label className="ap-label">
          ID de Sesión:
          <input
            className="ap-input"
            type="text"
            placeholder="AULAPUDU-40119"
            value={sessionCode}
            onChange={(e) => setSessionCode(e.target.value)}
          />
        </label>

        <label className="ap-label">
          Tu nombre:
          <input
            className="ap-input"
            type="text"
            placeholder="Valentina"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        {error && <div className="ap-error-text">{error}</div>}

        <button
          className="ap-btn ap-btn-full ap-btn-yellow"
          type="submit"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Unirse a la Sesión"}
        </button>
      </form>
    </div>
  );
}
