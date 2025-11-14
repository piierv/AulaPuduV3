// src/pages/Home.jsx
import { Link } from "react-router-dom";
import puduBg from "../assets/pudu-icon-grad.png";
import puduPresenter from "../assets/pudu-large.png";
import puduViewer from "../assets/pudu-icon.png";

export default function Home() {
  return (
    <div className="ap-hero">
      {/* Fondo pudú grande a la izquierda */}
      <div className="ap-hero-bg">
        <img src={puduBg} alt="Pudú de fondo" className="ap-hero-pudu" />
      </div>

      <div className="ap-hero-content">
        <span className="ap-pill">
          PLATAFORMA INTERACTIVA PARA APRENDIZAJE
        </span>

        <h1 className="ap-hero-title">
          Aprende sin
          <br />
          fronteras
        </h1>

        <p className="ap-hero-subtitle">
          Conecta, aprende y enseña en un entorno digital interactivo,
          <br />
          sin límites.
        </p>

        <div className="ap-hero-buttons">
          <Link to="/presenter/login" className="ap-btn ap-btn-green">
            <img
              src={puduPresenter}
              alt="Pudú presentador"
              className="ap-btn-icon"
            />
            <span>Entrar como presentador</span>
          </Link>

          <Link to="/viewer/join" className="ap-btn ap-btn-yellow">
            <img
              src={puduViewer}
              alt="Pudú espectador"
              className="ap-btn-icon"
            />
            <span>Entrar como espectador</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
