import api from "./api";

const TOKEN_KEY = "token";
const CURRENT_USER_KEY = "currentUser";

// ✅ REGISTER (after email verification update, register no longer returns token/user)
export const registerUser = async (userData) => {
  const res = await api.post("/auth/register", {
    name: userData.name.trim(),
    email: userData.email.trim(),
    password: userData.password.trim(),
  });

  // ✅ IMPORTANT: Do NOT store token/user on register
  // because user must verify email first.
  return res.data;
};

export const loginUser = async (email, password) => {
  const res = await api.post("/auth/login", {
    email: email.trim(),
    password: password.trim(),
  });

  // ✅ store only if exists
  if (res.data?.token) localStorage.setItem(TOKEN_KEY, res.data.token);
  if (res.data?.user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(res.data.user));

  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await api.post("/auth/forgot-password", { email: email.trim() });
  return res.data;
};

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
};

// ✅ Safe getters (prevents JSON.parse crash)
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
