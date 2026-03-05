import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://talentbridge-secure-enterprise-full-stack-hiring-production.up.railway.app";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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