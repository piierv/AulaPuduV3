// src/components/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function DashboardLayout() {
  return (
    <div className="ap-page ap-page--dashboard">
      <Navbar />
      <div className="ap-dashboard-body">
        <Sidebar />
        <section className="ap-dashboard-content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
