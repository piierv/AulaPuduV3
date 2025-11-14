// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LayoutPublic from "./components/LayoutPublic.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";

import Home from "./pages/Home.jsx";
import LoginPresenter from "./pages/LoginPresenter.jsx";
import RegisterPresenter from "./pages/RegisterPresenter.jsx";


import Overview from "./pages/dashboard/Overview.jsx";
import Presentations from "./pages/dashboard/Presentations.jsx";
import LiveSession from "./pages/dashboard/LiveSession.jsx";
import Questions from "./pages/dashboard/Questions.jsx";
import Audience from "./pages/dashboard/Audience.jsx";
import Materials from "./pages/dashboard/Materials.jsx";
import Reports from "./pages/dashboard/Reports.jsx";
import Settings from "./pages/dashboard/Settings.jsx";

import JoinViewer from "./pages/viewer/JoinSession.jsx";
import ViewerSession from "./pages/viewer/ViewerSession.jsx";

import { useAuth } from "./context/AuthContext.jsx";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/presenter/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route element={<LayoutPublic />}>
        <Route path="/" element={<Home />} />
        <Route path="/presenter/login" element={<LoginPresenter />} />
        <Route path="/presenter/register" element={<RegisterPresenter />} />
        <Route path="/viewer/join" element={<JoinViewer />} />

        <Route path="viewer/join" element={<JoinViewer/>}/>
        <Route path="/viewer/session/:code" element={<ViewerSession />} />
      </Route>

      {/* Rutas privadas del dashboard */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="presentations" element={<Presentations />} />
        <Route path="live" element={<LiveSession />} />
        <Route path="questions" element={<Questions />} />
        <Route path="audience" element={<Audience />} />
        <Route path="materials" element={<Materials />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
