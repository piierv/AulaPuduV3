// src/components/LiveSessionCard.jsx
import { useEffect, useState } from "react";
import Card from "./Card.jsx";
import { apiFetch } from "../services/api.js";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

const SESSION_KEY = "aulaPudu_liveSession";

export default function LiveSessionCard() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Cargar sesión guardada (si existe) al entrar al Dashboard
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        setSession(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveSession = (data) => {
    if (data) {
      setSession(data);
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } else {
      setSession(null);
      localStorage.removeItem(SESSION_KEY);
    }
  };

  // Generar nueva sesión con QR
  const generateCode = async () => {
    setError("");
    try {
      setLoading(true);

      // Llamamos a tu backend (si lo tienes) para crear sesión
      const res = await apiFetch("/live-session/new", {
        method: "POST",
      });

      // Forma flexible: admite res.session o res directamente
      const code = res.session?.qr_code || res.qr_code || res.code;
      const id = res.session?.id || res.id;
      const presenterId = res.session?.presenter_id || res.presenter_id;

      const newSession = {
        id,
        qr_code: code,
        presenter_id: presenterId,
      };

      saveSession(newSession);

      // Opcional: ir directo a Control de Sesión en Vivo
      navigate("/dashboard/live");
    } catch (err) {
      console.error(err);
      // Si tu backend aún no existe, al menos generamos un código “local”
      const fallbackCode = `AULAPUDU-${Math.floor(
        10000 + Math.random() * 89999
      )}`;

      saveSession({
        id: null,
        qr_code: fallbackCode,
      });

      setError(
        err.message ||
          "No se pudo generar la sesión en el servidor, usando código local."
      );
      navigate("/dashboard/live");
    } finally {
      setLoading(false);
    }
  };

  // Finalizar sesión globalmente
  const endSession = async () => {
    const confirm = window.confirm(
      "¿Seguro que quieres finalizar y borrar la sesión actual?"
    );
    if (!confirm) return;

    try {
      setLoading(true);
      setError("");

      // Intentar avisar al backend (si lo tienes)
      if (session?.id) {
        await apiFetch("/live-session/end", {
          method: "POST",
          body: { sessionId: session.id },
        });
      }

      saveSession(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo finalizar la sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card
        title="Estado de Sesión en Vivo"
        accent="green"
        footer={
          <button
            className="ap-btn ap-btn-small ap-btn-outline"
            onClick={generateCode}
            disabled={loading}
          >
            {loading ? "Generando..." : "Generar Nuevo Código QR"}
          </button>
        }
      >
        <p>Escanear para unirse:</p>
        <div className="ap-qr-placeholder">
          {session?.qr_code ? (
            <QRCodeSVG value={session.qr_code} size={120} />
          ) : (
            "QR"
          )}
        </div>
        <p className="ap-session-code">
          {session?.qr_code || "AULAPUDU-XXXXX"}
        </p>
        {error && <div className="ap-error-text">{error}</div>}
      </Card>

      <Card
        title="Finalizar Sesión Globalmente"
        accent="warning"
        footer={
          <button
            className="ap-btn ap-btn-small ap-btn-danger"
            onClick={endSession}
            disabled={loading || !session}
          >
            {loading ? "Procesando..." : "Finalizar y Borrar Sesión"}
          </button>
        }
      >
        <p>
          Elimina permanentemente la sesión de la base de datos y desconecta a
          todos los espectadores.
        </p>
      </Card>
    </>
  );
}
