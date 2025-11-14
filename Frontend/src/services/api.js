// src/services/api.js

const API_BASE_URL = "http://localhost:4000/api";

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;

  // Leer token desde localStorage (lo guarda AuthContext)
  let token = null;
  try {
    const stored = localStorage.getItem("aulapudu_auth");
    if (stored) {
      const parsed = JSON.parse(stored);
      token = parsed.token || null;
    }
  } catch (e) {
    // si se rompe el JSON, ignoramos
  }

  // Headers base
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

  // Solo agregamos Authorization si HAY token
  // (así /auth/login funciona sin token)
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fetchOptions = {
    method: options.method || "GET",
    headers,
    credentials: "include",
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, fetchOptions);

  // Intentamos leer JSON, pero si no hay lo manejamos
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    // Usamos mensaje del backend si existe
    const msg =
      (data && (data.msg || data.error || data.message)) ||
      `Error HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}
