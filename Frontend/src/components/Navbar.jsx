// src/components/Navbar.jsx
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="ap-navbar">
      <div className="ap-navbar-left">
        <Link to="/" className="ap-brand">
          <img src={logo} alt="AulaPudu logo" className="ap-logo" />
          <span className="ap-brand-text">AulaPudu</span>
        </Link>
      </div>

      <nav className="ap-navbar-right">
        <NavLink to="/" className="ap-nav-link">
          Inicio
        </NavLink>
        <NavLink to="/presenter/login" className="ap-nav-link">
          Iniciar
        </NavLink>
        <NavLink to="/viewer/join" className="ap-nav-link">
          Unirse
        </NavLink>

        {user && (
          <>
            <NavLink to="/dashboard" className="ap-nav-link ap-nav-link--strong">
              Dashboard
            </NavLink>
            <button className="ap-btn-ghost" onClick={logout}>
              Cerrar sesión
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
