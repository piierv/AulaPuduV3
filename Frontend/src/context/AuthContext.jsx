// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, email, nombre, role }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Leer del localStorage al inicio
  useEffect(() => {
    const stored = localStorage.getItem("aulapudu_auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed.user || null);
        setToken(parsed.token || null);
      } catch {
        // ignore
      }
    }
    setLoading(false);
  }, []);

  // OJO: recibe email y password como parámetros separados
  const login = async (email, password) => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: { email, password }, // igual que en Postman
    });

    // Ajustado a lo que devuelve tu backend (Postman)
    const dataUser = {
      id: res.user.id,
      email: res.user.email,
      nombre: res.user.full_name,
      role: res.user.role,
    };

    setUser(dataUser);
    setToken(res.token);

    localStorage.setItem(
      "aulapudu_auth",
      JSON.stringify({ user: dataUser, token: res.token })
    );
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("aulapudu_auth");
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
