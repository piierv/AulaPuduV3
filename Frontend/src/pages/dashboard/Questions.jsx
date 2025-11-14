// src/pages/dashboard/Questions.jsx
import Card from "../../components/Card.jsx";

export default function Questions() {
  return (
    <div className="ap-dashboard-section">
      <h2 className="ap-section-title">Sistema de Preguntas y Formularios</h2>

      <Card title="Crear Nueva Pregunta">
        <div className="ap-tabs">
          <button className="ap-tab ap-tab--active">Opción Múltiple</button>
          <button className="ap-tab">Verdadero/Falso</button>
          <button className="ap-tab">Respuesta Abierta</button>
        </div>

        <div className="ap-form">
          <label className="ap-label">
            Escribe tu pregunta aquí
            <input className="ap-input" type="text" />
          </label>

          <label className="ap-label">
            Opción 1
            <input className="ap-input" type="text" />
          </label>

          <label className="ap-label">
            Opción 2
            <input className="ap-input" type="text" />
          </label>

          <button className="ap-btn ap-btn-small ap-btn-outline">
            + Añadir Opción
          </button>

          <button className="ap-btn ap-btn-yellow ap-btn-full">
            Guardar Pregunta
          </button>
        </div>
      </Card>

      <Card title="Preguntas Guardadas">
        <p>Todavía no hay preguntas guardadas.</p>
      </Card>
    </div>
  );
}
