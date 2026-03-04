import api from "./api";

const TOKEN_KEY = "token";
const CURRENT_USER_KEY = "currentUser";

/* =========================
   USER AUTH
========================= */

// ✅ REGISTER
export const registerUser = async (userData) => {
  const res = await api.post("/auth/register", {
    name: (userData?.name || "").trim(),
    email: (userData?.email || "").trim(),
    password: (userData?.password || "").trim(),
  });
  return res.data;
};

// ✅ LOGIN
export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", {
    email: (email || "").trim(),
    password: (password || "").trim(),
  });

  const token = res?.data?.token;
  const user = res?.data?.user;

  // store only if valid
  if (token && token !== "undefined" && token !== "null") {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  return res.data;
};

// ✅ USER FORGOT
export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", {
    email: (email || "").trim(),
  });
  return res.data;
};

// ✅ USER RESET
export const resetPassword = async ({ token, email, newPassword }) => {
  const res = await api.post("/auth/reset-password", {
    token,
    email,
    newPassword,
  });
  return res.data;
};

export const logoutUser = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem("admin");
};

// ✅ Safe getters
export const getToken = () => {
  const t = localStorage.getItem(TOKEN_KEY);
  if (!t || t === "undefined" || t === "null") return null;
  return t;
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw);
  } catch (e) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }
};

/* =========================
   ADMIN AUTH
   Backend mounted:
   app.use("/api/admin/auth", adminAuthRoutes);
   So frontend calls (baseURL already /api):
   POST /admin/auth/forgot-password
   POST /admin/auth/reset-password
========================= */

export const adminForgotPassword = async (email) => {
  const res = await api.post("/admin/auth/forgot-password", {
    email: (email || "").trim(),
  });
  return res.data;
};

export const adminResetPassword = async ({ token, email, newPassword }) => {
  const res = await api.post("/admin/auth/reset-password", {
    token,
    email,
    newPassword,
  });
  return res.data;
};