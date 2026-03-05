import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://talentbridge-secure-enterprise-full-stack-hiring-production.up.railway.app";

// ✅ TEMP debug (remove later)
console.log("✅ API_BASE_URL =", API_BASE_URL);

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  timeout: 15000, // ✅ IMPORTANT: never hang forever
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

    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
    }

    return Promise.reject(error);
  }
);

export default api;