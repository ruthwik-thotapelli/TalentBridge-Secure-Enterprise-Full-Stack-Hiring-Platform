import axios from "axios";

const api = axios.create({
  baseURL: "https://talentbridge-secure-enterprise-full-stack-hiring-production.up.railway.app",
  withCredentials: true
});

// auto attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;