// src/pages/dashboard/Reports.jsx
import Card from "../../components/Card.jsx";

export default function Reports() {
  return (
    <div className="ap-dashboard-section">
      <h2 className="ap-section-title">Informes y Analíticas</h2>

      <Card title="Resultados de Quiz: 'Intro a IA'">
        <p>Resumen de respuestas y datos de participantes.</p>
        <button className="ap-btn ap-btn-small ap-btn-outline">
          Generar Reporte HTML
        </button>
      </Card>

      <Card title="Reporte de Asistencia: Última Sesión">
        <p>Registros detallados de asistencia incluyendo tiempos de conexión.</p>
        <button className="ap-btn ap-btn-small ap-btn-outline">
          Ver Asistencia
        </button>
      </Card>
    </div>
  );
}
