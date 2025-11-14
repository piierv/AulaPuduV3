// src/components/LayoutPublic.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function LayoutPublic() {
  return (
    <div className="ap-page">
      <Navbar />
      <main className="ap-main">
        <Outlet />
      </main>
    </div>
  );
}
