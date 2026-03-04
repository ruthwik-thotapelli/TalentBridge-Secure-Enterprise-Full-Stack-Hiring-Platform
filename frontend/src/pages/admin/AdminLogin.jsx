import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(() => localStorage.getItem("adminEmail") || "");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(() => localStorage.getItem("adminRemember") === "true");

  const [showPass, setShowPass] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  const emailRef = useRef(null);

  const showToast = (m) => {
    setToast(m);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(""), 2200);
  };

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    localStorage.setItem("adminRemember", String(remember));
    if (remember) localStorage.setItem("adminEmail", email);
    else localStorage.removeItem("adminEmail");
  }, [remember, email]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setErr("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);

  const strength = useMemo(() => {
    const p = password || "";
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }, [password]);

  const strengthLabel = useMemo(() => {
    if (!password) return "—";
    if (strength <= 2) return "Weak";
    if (strength === 3) return "Okay";
    if (strength === 4) return "Strong";
    return "Very Strong";
  }, [strength, password]);

  const strengthWidth = useMemo(() => `${(strength / 5) * 100}%`, [strength]);

  const securityLevel = useMemo(() => {
    if (!password) return { badge: "Security", text: "Enter password to evaluate", tone: "neutral" };
    if (strength <= 2) return { badge: "Security", text: "Improve password strength", tone: "warn" };
    if (strength === 3) return { badge: "Security", text: "Decent strength detected", tone: "ok" };
    return { badge: "Security", text: "Strong password detected", tone: "good" };
  }, [password, strength]);

  const helperHints = useMemo(() => {
    const hints = [];
    if (!email) hints.push({ k: "email", t: "Use your admin email address" });
    if (email && !emailOk) hints.push({ k: "emailok", t: "Email format looks incorrect" });
    if (!password) hints.push({ k: "pass", t: "Password is required for admin access" });
    if (capsOn) hints.push({ k: "caps", t: "Caps Lock is ON" });
    if (password && strength <= 2) hints.push({ k: "weak", t: "Add uppercase, number, and symbol to strengthen" });
    return hints;
  }, [email, emailOk, password, capsOn, strength]);

  const toneClasses = useMemo(() => {
    const base = "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border";
    if (securityLevel.tone === "good")
      return { chip: `${base} bg-emerald-500/10 text-emerald-200 border-emerald-400/20` };
    if (securityLevel.tone === "ok")
      return { chip: `${base} bg-indigo-500/10 text-indigo-200 border-indigo-400/20` };
    if (securityLevel.tone === "warn")
      return { chip: `${base} bg-amber-500/10 text-amber-200 border-amber-400/20` };
    return { chip: `${base} bg-white/5 text-white/70 border-white/10` };
  }, [securityLevel.tone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const em = email.trim();
    const pw = password.trim();

    if (!emailOk) {
      setErr("Please enter a valid email.");
      emailRef.current?.focus();
      return;
    }
    if (!pw) {
      setErr("Password is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(em, pw);

      const role = res?.user?.role;
      if (role !== "admin") {
        localStorage.removeItem("admin");
        setErr("Access denied. This portal is for Admin only.");
        return;
      }

      localStorage.setItem("admin", "true");
      showToast("Welcome Admin ✅");
      navigate("/admin/dashboard");
    } catch (e2) {
      const msg = e2.response?.data?.message || e2.message || "Login failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center overflow-x-hidden px-6 py-14 text-white
                 bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-28 -left-28 w-[520px] h-[520px] rounded-full bg-indigo-500/25 blur-[120px]" />
        <div className="absolute top-1/3 -right-28 w-[480px] h-[480px] rounded-full bg-fuchsia-500/20 blur-[120px]" />
        <div className="absolute -bottom-28 left-1/3 w-[520px] h-[520px] rounded-full bg-cyan-500/15 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 15%, rgba(99,102,241,0.7), transparent 45%), radial-gradient(circle at 75% 30%, rgba(217,70,239,0.6), transparent 45%), radial-gradient(circle at 55% 80%, rgba(34,211,238,0.55), transparent 45%)",
          }}
        />
      </div>

      {toast && (
        <div className="fixed top-6 z-50">
          <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg">
            <p className="text-sm text-white/90">{toast}</p>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[26px] bg-white/10 border border-white/15 backdrop-blur-2xl shadow-[0_25px_90px_rgba(99,102,241,0.18)] overflow-hidden">
          <div className="px-8 pt-6 pb-5 border-b border-white/10">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/10
                           hover:bg-white/15 hover:border-white/20 transition text-xs text-white/80"
              >
                <span className="h-2 w-2 rounded-full bg-white/60" />
                Back to User Login
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70">
                <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                Admin Access Only
              </div>
            </div>

            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-widest text-white/60">TALENTBRIDGE • ADMIN</p>
                <h1 className="text-3xl font-extrabold mt-2">Admin Portal</h1>
                <p className="text-sm text-white/70 mt-1">Secure authentication for administrators</p>
              </div>

              <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 grid place-items-center shadow-lg shadow-fuchsia-500/20">
                <span className="text-xl">👑</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-200 border border-emerald-400/20">
                Protected
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-200 border border-indigo-400/20">
                Role-based (RBAC)
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/70 border border-white/10">
                JWT Session
              </span>
              <span className={toneClasses.chip}>
                <span className="text-white/60">🛡️</span>
                {securityLevel.text}
              </span>
            </div>
          </div>

          <div className="px-8 py-7">
            {err && (
              <div className="mb-4 text-sm text-rose-100 bg-rose-500/10 border border-rose-400/20 rounded-2xl px-4 py-3">
                {err}
              </div>
            )}

            {helperHints.length > 0 && (
              <div className="mb-5 rounded-2xl bg-white/[0.06] border border-white/10 p-4">
                <p className="text-xs text-white/60">Quick checks</p>
                <div className="mt-2 space-y-2">
                  {helperHints.slice(0, 3).map((h) => (
                    <div key={h.k} className="text-sm text-white/75 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                      <span>{h.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-white/80 mb-2">Admin Email</label>
                <div className="relative">
                  <input
                    ref={emailRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.com"
                    className="w-full px-4 py-3 rounded-2xl bg-black/25 border border-white/15 placeholder-white/35
                               focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-white/20"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/60">
                    {email.length ? (emailOk ? "✅" : "⚠️") : "✉️"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => setCapsOn(e.getModifierState && e.getModifierState("CapsLock"))}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-16 rounded-2xl bg-black/25 border border-white/15 placeholder-white/35
                               focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-white/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl
                               bg-white/10 border border-white/10 hover:bg-white/15 transition text-xs"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>

                {capsOn && <p className="mt-2 text-xs text-amber-200">Caps Lock is ON</p>}

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Password strength</span>
                    <span className="text-white/85 font-semibold">{strengthLabel}</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full rounded-full bg-white/10 border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-emerald-400 transition-all"
                      style={{ width: strengthWidth }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-white/70 select-none">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 accent-indigo-400"
                  />
                  Remember email
                </label>

                <button
                  type="button"
                  onClick={() => navigate("/admin/forgot-password", { state: { email } })}
                  className="text-sm text-white/75 hover:text-white transition underline underline-offset-4 decoration-white/30 hover:decoration-white/70"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-2xl text-base font-bold transition-all
                  ${
                    loading
                      ? "bg-white/10 border border-white/10 text-white/55 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 hover:scale-[1.01] hover:shadow-[0_0_55px_rgba(217,70,239,0.30)]"
                  }`}
              >
                {loading ? "Signing in..." : "Continue"}
              </button>

              <div className="pt-1 flex items-center justify-between text-xs text-white/55">
                <span className="text-white/50">Tip: Press Esc to clear error</span>
                <button
                  type="button"
                  onClick={() => {
                    setPassword("");
                    setErr("");
                    showToast("Cleared ✅");
                  }}
                  className="hover:text-white/80 transition"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>

          <div className="px-8 py-5 border-t border-white/10 bg-black/10">
            <p className="text-xs text-white/60">
              Only accounts with <b className="text-white/85">role = admin</b> can access this portal.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/45 mt-5">TalentBridge • Secure Admin Access</p>
      </div>
    </div>
  );
}