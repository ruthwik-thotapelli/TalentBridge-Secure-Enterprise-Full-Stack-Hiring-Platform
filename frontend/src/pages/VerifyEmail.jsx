import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://talentbridge-secure-enterprise-full-stack-hiring-production.up.railway.app";

export default function VerifyEmail() {
  const { search } = useLocation();
  const [msg, setMsg] = useState("Verifying your email...");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");
    const email = params.get("email");

    if (!token || !email) {
      setMsg("Invalid verification link.");
      return;
    }

    window.location.href = `${API_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(email)}`;
  }, [search]);

  return (
    <div style={{ padding: 30, textAlign: "center", color: "white" }}>
      <h2>{msg}</h2>
    </div>
  );
}