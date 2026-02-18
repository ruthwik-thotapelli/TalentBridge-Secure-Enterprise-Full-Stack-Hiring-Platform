import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRoute() {
  // admin login stored here in AdminLogin.jsx
  const isAdmin = localStorage.getItem("admin") === "true";

  // if not admin -> go to admin login
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // if admin -> allow pages inside
  return <Outlet />;
}
