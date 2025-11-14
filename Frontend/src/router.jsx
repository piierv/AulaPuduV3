import { Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home";
import LoginPresenter from "./pages/LoginPresenter";
import JoinViewer from "./pages/JoinSession";
import DashboardPresenter from "./pages/dashboard/Overview";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/iniciar" element={<LoginPresenter />} />
      <Route path="/unirse" element={<JoinViewer />} />
      <Route path="/dashboard" element={<DashboardPresenter />} />
    </Routes>
  );
}
