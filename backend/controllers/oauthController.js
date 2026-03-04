import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OauthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const name = params.get("name");
    const email = params.get("email");
    const provider = params.get("provider");

    if (!token) {
      navigate("/login?oauth=failed", { replace: true });
      return;
    }

    // ✅ store token
    localStorage.setItem("token", token);

    // ✅ optional: store basic user info (for navbar / UI)
    const currentUser = {
      name: name || "",
      email: email || "",
      provider: provider || "",
    };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    // ✅ redirect
    navigate("/dashboard", { replace: true });
  }, [navigate]);

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

        <p className="text-xs text-white/50 mt-5">
          If this takes too long, go back and try again.
        </p>
      </div>
    </div>
  );
}