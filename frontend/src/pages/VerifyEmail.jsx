import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "https://talentbridge-secure-enterprise-full-stack-hiring-production.up.railway.app";

export default function VerifyEmail() {
  const { search } = useLocation();
  const [msg, setMsg] = useState("🔄 Verifying your email...");
  const [subMsg, setSubMsg] = useState("Please wait while we redirect you securely.");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");
    const email = params.get("email");

    if (!token || !email) {
      setMsg("❌ Invalid verification link.");
      setSubMsg("The link is missing required information.");
      return;
    }

    const redirectUrl = `${API_BASE_URL}/api/auth/verify-email?token=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(email)}`;

    const timer = setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1200);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 flex items-center justify-center px-4 sm:px-6 overflow-x-hidden">
      <div className="w-full max-w-lg rounded-3xl bg-white/10 border border-white/15 backdrop-blur-2xl shadow-[0_25px_90px_rgba(99,102,241,0.18)] p-6 sm:p-8 text-center text-white">
        <div className="mx-auto mb-5 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-fuchsia-500/20">
          ✉️
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">{msg}</h1>
        <p className="mt-3 text-white/70 text-sm sm:text-base">{subMsg}</p>

        <div className="mt-6 flex items-center justify-center gap-2 text-white/60 text-sm">
          <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          Secure email verification in progress
        </div>

        <div className="mt-8 h-2 w-full rounded-full bg-white/10 overflow-hidden border border-white/10">
          <div className="h-full w-1/2 bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 animate-pulse" />
        </div>
      </div>
    </div>
  );
}