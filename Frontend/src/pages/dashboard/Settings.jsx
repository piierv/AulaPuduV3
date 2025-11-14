// src/pages/dashboard/Settings.jsx
import Card from "../../components/Card.jsx";

export default function Settings() {
  return (
    <div className="ap-dashboard-section">
      <h2 className="ap-section-title">Configuración</h2>

      <Card title="Preferencias del Presentador">
        <div className="ap-form">
          <label className="ap-label">
            Nombre visible:
            <input className="ap-input" type="text" placeholder="Ej. Prof. Valdivia" />
          </label>

          <label className="ap-label">
            Color de tema:
            <select className="ap-input">
              <option>Verde (por defecto)</option>
              <option>Azul</option>
              <option>Naranja</option>
            </select>
          </label>

          <button className="ap-btn ap-btn-green ap-btn-full">
            Guardar Cambios
          </button>
        </div>
      </Card>
    </div>
  );
}
