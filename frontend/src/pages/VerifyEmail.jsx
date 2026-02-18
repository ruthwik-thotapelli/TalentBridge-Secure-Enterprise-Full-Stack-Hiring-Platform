import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

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

    // ✅ Browser redirect to backend verify route
    window.location.href = `http://localhost:5000/api/auth/verify-email?token=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(email)}`;
  }, [search]);

  return (
    <div style={{ padding: 30, textAlign: "center", color: "white" }}>
      <h2>{msg}</h2>
    </div>
  );
}
