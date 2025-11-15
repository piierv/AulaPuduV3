// src/pages/dashboard/Overview.jsx
import Card from "../../components/Card.jsx";
import LiveSessionCard from "../../components/LiveSessionCard.jsx";

export default function Overview() {
  return (
    <div className="ap-dashboard-section">
      <h2 className="ap-section-title">Resumen del Dashboard</h2>

      <div className="ap-grid ap-grid-3">
        
        {/* Tarjeta 1 – Presentación actual */}
        <Card
          title="Presentación Actual"
          accent="neutral"
          footer={
            <button className="ap-btn ap-btn-small ap-btn-outline">
              Gestionar Presentaciones
            </button>
          }
        >
          <p>No hay presentación activa. Inicia una nueva o continúa desde tu biblioteca.</p>
        </Card>

        {/* Tarjeta 2 – Reemplazada por el sistema real de QR */}
        <LiveSessionCard />

        {/* Tarjeta 3 – Finalizar sesión */}
      
      </div>
    </div>
  );
}
