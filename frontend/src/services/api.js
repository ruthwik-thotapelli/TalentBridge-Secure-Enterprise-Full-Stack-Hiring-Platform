import axios from "axios";

/**
 * ✅ API BASE URL
 * - Local: http://localhost:5000
 * - Production: REACT_APP_API_URL (Railway backend domain)
 *
 * NOTE:
 * REACT_APP_API_URL should be like:
 * https://your-backend.up.railway.app
 * (no /api at end)
 */

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token (JWT)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error?.response?.data || error.message);

    // auto logout if token invalid/expired
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
    }

    return Promise.reject(error);
  }
);

export default api;