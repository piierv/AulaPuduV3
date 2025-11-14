// src/pages/RegisterPresenter.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../services/api.js";

export default function RegisterPresenter() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== password2) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      // Ajusta los campos según tu backend:
      // aquí asumo que /auth/register recibe { email, password, full_name, role }
      await apiFetch("/auth/register", {
        method: "POST",
        body: {
          email,
          password,
          full_name: fullName,
          role: "presenter",
        },
      });

      // Después de registrarse, lo mandamos al login de presentador
      // Cambia la ruta si tu login está en otra (por ej. "/login")
      navigate("/presenter/login");
    } catch (err) {
      setError(err.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-auth-wrapper">
      <div className="ap-auth-card">
        <h2 className="ap-auth-title">Registro de Presentador</h2>

        <form onSubmit={handleSubmit} className="ap-form">
          <label className="ap-label">
            Nombre completo:
            <input
              className="ap-input"
              type="text"
              placeholder="Tu nombre"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>

          <label className="ap-label">
            Correo electrónico:
            <input
              className="ap-input"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="ap-label">
            Contraseña:
            <input
              className="ap-input"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <label className="ap-label">
            Repite la contraseña:
            <input
              className="ap-input"
              type="password"
              placeholder="********"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
            />
          </label>

          {error && <div className="ap-error-text">{error}</div>}

          <button
            className="ap-btn ap-btn-green ap-btn-full"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="ap-auth-footer">
          ¿Ya tienes una cuenta?{" "}
          <Link className="ap-link" to="/presenter/login">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
