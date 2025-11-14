// src/pages/LoginPresenter.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPresenter() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 👇 antes: await login({ email, password });
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ap-auth-wrapper">
      <div className="ap-auth-card">
        <h2 className="ap-auth-title">Inicio de Presentador</h2>

        <form onSubmit={handleSubmit} className="ap-form">
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

          {error && <div className="ap-error-text">{error}</div>}

          <button
            className="ap-btn ap-btn-green ap-btn-full"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="ap-auth-footer">
          ¿No tienes una cuenta?{" "}
          <Link className="ap-link" to="/presenter/register">
            Regístrate aquí
          </Link>
        </p>

      </div>
    </div>
  );
}
