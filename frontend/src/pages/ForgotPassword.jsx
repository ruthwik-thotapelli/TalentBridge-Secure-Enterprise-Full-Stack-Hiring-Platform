import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [cooldown, setCooldown] = useState(0);

  const emailOk = useMemo(() => {
    const v = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const submit = async (e) => {
    e?.preventDefault?.();
    setErr("");
    setMsg("");

    const clean = email.trim();
    if (!emailOk) {
      setErr("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await forgotPassword(clean);
      setMsg(res?.message || "Reset link sent. Please check your email.");
      setCooldown(30);
    } catch (e2) {
      setErr(e2.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const clearState = () => {
    setMsg("");
    setErr("");
    setEmail("");
    setCooldown(0);
  };

  return (
    <div
      className="min-h-screen flex items-start justify-center
                 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900
                 px-6 py-20 text-white"
    >
      {/* Card (NO glass, solid) */}
      <div className="w-full max-w-md bg-[#4b2a79] border border-white/15 rounded-3xl shadow-2xl px-10 py-10 mt-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2">Forgot Password</h1>
          <p className="text-white/80">
            Enter your email and we’ll send a reset link
          </p>
        </div>

        {/* Alerts */}
        {err && (
          <div className="mb-5 text-sm text-red-200 bg-red-500/15 border border-red-500/25 rounded-xl px-4 py-3">
            {err}
          </div>
        )}

        {msg && (
          <div className="mb-5 text-sm text-green-200 bg-green-500/15 border border-green-500/25 rounded-xl px-4 py-3">
            {msg}
          </div>
        )}

        {/* FORM */}
        {!msg ? (
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label className="block text-sm mb-2 text-white/85">
                Email Address
              </label>

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/15
                             border border-white/20 placeholder-white/50
                             focus:outline-none focus:ring-2 focus:ring-purple-300"
                />

                {/* validation dot */}
                {email.length > 0 && (
                  <span
                    className={`absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full ${
                      emailOk ? "bg-green-400" : "bg-red-400"
                    }`}
                  />
                )}
              </div>

              <p className="mt-2 text-xs text-white/70">
                Reset link will expire for security.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !emailOk}
              className={`w-full py-3 rounded-xl text-lg font-semibold
                         bg-gradient-to-r from-green-400 to-emerald-500
                         hover:scale-[1.02] transition
                         ${(loading || !emailOk) ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="py-3 rounded-xl bg-white/15 border border-white/20 hover:bg-white/20 transition"
              >
                Back
              </button>

              <button
                type="button"
                onClick={() => window.open("https://mail.google.com", "_blank")}
                className="py-3 rounded-xl bg-white/15 border border-white/20 hover:bg-white/20 transition"
              >
                Open Gmail
              </button>
            </div>
          </form>
        ) : (
          /* SUCCESS VIEW */
          <div className="space-y-4">
            <div className="rounded-xl bg-white/10 border border-white/15 p-4">
              <p className="text-sm text-white/85">
                If an account exists for{" "}
                <span className="font-semibold text-white">{email.trim()}</span>,
                you’ll receive a reset link.
              </p>

              <ul className="mt-3 text-xs text-white/70 space-y-1">
                <li>• Check Inbox / Spam / Promotions</li>
                <li>• Email may take 1–2 minutes</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => window.open("https://mail.google.com", "_blank")}
              className="w-full py-3 rounded-xl bg-white/15 border border-white/20 hover:bg-white/20 transition font-semibold"
            >
              Open Gmail
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={loading || cooldown > 0}
              className={`w-full py-3 rounded-xl font-semibold
                         bg-gradient-to-r from-purple-400 to-indigo-500
                         hover:scale-[1.02] transition
                         ${(loading || cooldown > 0) ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : loading ? "Resending..." : "Resend Email"}
            </button>

            <button
              type="button"
              onClick={clearState}
              className="w-full py-3 rounded-xl bg-white/15 border border-white/20 hover:bg-white/20 transition"
            >
              Try different email
            </button>

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-xl bg-white/15 border border-white/20 hover:bg-white/20 transition"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
