import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function OAuthSuccess() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(search);

      const token = params.get("token");
      const name = params.get("name");
      const email = params.get("email");
      const provider = params.get("provider");

      if (!token) {
        navigate("/login?oauth=failed", { replace: true });
        return;
      }

      localStorage.setItem("token", token);

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          name: name || "",
          email: email || "",
          provider: provider || "oauth",
        })
      );

      try {
        const res = await api.get("/profile/me");
        const realUser = res?.data?.user;

        if (realUser) {
          localStorage.setItem("currentUser", JSON.stringify(realUser));
        }

        navigate("/", { replace: true }); // ✅ go to home page
      } catch (err) {
        console.error("OAuth /profile/me failed:", err?.response?.data || err.message);
        setError("OAuth login succeeded, but profile fetch failed.");
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
        navigate("/login?oauth=failed", { replace: true });
      }
    };

    run();
  }, [navigate, search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-bold">Signing you in…</h1>
        <p className="text-white/70 mt-2">
          Please wait, we’re securely logging you into TalentBridge.
        </p>

        <div className="mt-6 w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-white/40 animate-pulse" />
        </div>

        {error && (
          <p className="text-sm text-red-200 mt-5 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            {error}
          </p>
        )}

        <p className="text-xs text-white/50 mt-5">
          If this takes too long, go back and try again.
        </p>
      </div>
    </div>
  );
}