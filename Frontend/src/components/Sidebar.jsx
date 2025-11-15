// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard", label: "Resumen", icon: "📊" },
  { to: "/dashboard/presentations", label: "Presentaciones", icon: "📑" },
  { to: "/dashboard/crearpresentation",label:"Crear presentaciones", icon: "✏️"},
  { to: "/dashboard/crearmodelo3d",label:"Crear Modelo 3D", icon: "🌌"},
  { to: "/dashboard/live", label: "Sesión en Vivo", icon: "🔴" },
  { to: "/dashboard/questions", label: "Preguntas", icon: "❓" },
  { to: "/dashboard/audience", label: "Gestión de Espectadores", icon: "👥" },
  { to: "/dashboard/materials", label: "Materiales", icon: "📚" },
  { to: "/dashboard/reports", label: "Informes", icon: "📈" },
  { to: "/dashboard/settings", label: "Configuración", icon: "⚙️" },
];

export default function Sidebar() {
  return (
    <aside className="ap-sidebar">
      <nav>
        <ul className="ap-sidebar-list">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                end={item.to === "/dashboard"}
                to={item.to}
                className={({ isActive }) =>
                  "ap-sidebar-link" + (isActive ? " ap-sidebar-link--active" : "")
                }
              >
                <span className="ap-sidebar-icon">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
