// src/pages/dashboard/Audience.jsx
import Card from "../../components/Card.jsx";

export default function Audience() {
  return (
    <div className="ap-dashboard-section">
      <h2 className="ap-section-title">Gestión de Espectadores</h2>

      <Card title="Trabajo Grupal">
        <div className="ap-grid ap-grid-2">
          <label className="ap-label">
            Número de Grupos:
            <input className="ap-input" type="number" min="1" defaultValue="3" />
          </label>
          <label className="ap-label">
            Tamaño Máx. de Grupo:
            <input className="ap-input" type="number" min="1" placeholder="Opcional" />
          </label>
        </div>
        <button className="ap-btn ap-btn-green ap-btn-small">
          Dividir en Grupos
        </button>
      </Card>

      <Card title="Espectadores Conectados (0 Activos)">
        <p>Inicia una sesión en vivo para ver los espectadores.</p>
        <button className="ap-btn ap-btn-small ap-btn-outline">
          Refrescar Lista
        </button>
      </Card>

      <Card title="Archivos de Espectadores">
        <p>No hay nuevos archivos subidos por espectadores.</p>
        <button className="ap-btn ap-btn-small ap-btn-outline">
          Ver Todos los Archivos
        </button>
      </Card>
    </div>
  );
}
