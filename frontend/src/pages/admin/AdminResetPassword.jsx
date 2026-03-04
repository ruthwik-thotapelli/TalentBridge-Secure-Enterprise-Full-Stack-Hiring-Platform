import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminResetPassword } from "../../services/authService";

export default function AdminResetPassword() {
  const { search } = useLocation();
  const navigate = useNavigate();

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const token = params.get("token");
  const email = params.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const newRef = useRef(null);

  const showToast = (m) => {
    setToast(m);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(""), 2000);
  };

  useEffect(() => {
    newRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setErr("");
        setMsg("");
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShowNew((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const rules = useMemo(() => {
    const p = newPassword || "";
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[^A-Za-z0-9]/.test(p),
      common: !/(password|admin|qwerty|123456|welcome)/i.test(p),
    };
  }, [newPassword]);

  const strengthCount = useMemo(() => Object.values(rules).filter(Boolean).length, [rules]);

  const strength = useMemo(() => {
    if (!newPassword) return { label: "—", width: "0%", tone: "text-white/70" };
    if (strengthCount <= 3) return { label: "Weak", width: "35%", tone: "text-rose-200" };
    if (strengthCount <= 5) return { label: "Medium", width: "65%", tone: "text-amber-200" };
    return { label: "Strong", width: "100%", tone: "text-emerald-200" };
  }, [newPassword, strengthCount]);

  const passwordsMatch = useMemo(
    () => newPassword.length > 0 && newPassword === confirm,
    [newPassword, confirm]
  );

  const canSubmit = useMemo(() => {
    return (
      Boolean(token) &&
      Boolean(email) &&
      passwordsMatch &&
      rules.length &&
      rules.upper &&
      rules.lower &&
      rules.number &&
      rules.common
    );
  }, [token, email, passwordsMatch, rules]);

  const maskedEmail = useMemo(() => {
    if (!email) return "";
    const [u, d] = email.split("@");
    if (!u || !d) return email;
    const a = u.slice(0, 2);
    const b = u.length > 4 ? u.slice(-1) : "";
    return `${a}${"*".repeat(Math.max(1, u.length - 3))}${b}@${d}`;
  }, [email]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!token || !email) return setErr("Invalid or expired reset link.");
    if (!passwordsMatch) return setErr("Passwords do not match.");
    if (!canSubmit) return setErr("Please enter a stronger password.");

    setLoading(true);
    try {
      const res = await adminResetPassword({ token, email, newPassword });
      setMsg(res?.message || "Admin password updated successfully ✅");
      showToast("Password updated ✅");
      window.setTimeout(() => navigate("/admin/login"), 1100);
    } catch (e2) {
      setErr(e2.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const copyEmail = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      showToast("Email copied ✅");
    } catch {
      showToast("Copy failed");
    }
  };

  const clearAll = () => {
    setNewPassword("");
    setConfirm("");
    setErr("");
    setMsg("");
    showToast("Cleared ✅");
    newRef.current?.focus();
  };

  if (!token || !email) {
    return (
      <div
        className="min-h-screen relative flex items-center justify-center overflow-x-hidden px-6 py-14 text-white
                   bg-gradient-to-br from-slate-950 via-indigo-950 to-fuchsia-950"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 -left-28 w-[520px] h-[520px] rounded-full bg-indigo-500/25 blur-[120px]" />
          <div className="absolute top-1/3 -right-28 w-[480px] h-[480px] rounded-full bg-fuchsia-500/20 blur-[120px]" />
          <div className="absolute -bottom-28 left-1/3 w-[520px] h-[520px] rounded-full bg-cyan-500/15 blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-[26px] bg-white/10 border border-white/15 backdrop-blur-2xl shadow-[0_25px_90px_rgba(99,102,241,0.18)] px-8 py-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 grid place-items-center shadow-lg shadow-fuchsia-500/20">
              <span className="text-2xl">⛔</span>
            </div>

            <h2 className="text-2xl font-extrabold mt-4 mb-2">Invalid Link</h2>
            <p className="text-white/70 mb-6">
              This admin reset link is invalid or expired. Please request a new one.
            </p>

            <button
              onClick={() => navigate("/admin/forgot-password")}
              className="w-full py-3.5 rounded-2xl text-base font-bold bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 hover:scale-[1.01] transition"
            >
              Request New Link
            </button>

            <button
              onClick={() => navigate("/admin/login")}
              className="w-full mt-3 py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
            >
              Back to Admin Login
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                onClick={() => navigate("/admin/login")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/10
                           hover:bg-white/15 hover:border-white/20 transition text-xs text-white/80"
              >
                <span className="h-2 w-2 rounded-full bg-white/60" />
                Back to Login
              </button>

              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10
                           hover:bg-white/10 transition text-xs text-white/70"
              >
                ✨ Clear
              </button>
            </div>

            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-widest text-white/60">TALENTBRIDGE • ADMIN</p>
                <h1 className="text-3xl font-extrabold mt-2">Reset Password</h1>
                <p className="text-sm text-white/70 mt-1">Set a strong new admin password.</p>
              </div>

              <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 grid place-items-center shadow-lg shadow-fuchsia-500/20">
                <span className="text-xl">🛡️</span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-white/60">Resetting for</p>
                <p className="text-sm font-semibold text-white/85">{maskedEmail}</p>
              </div>
              <button
                type="button"
                onClick={copyEmail}
                className="px-3 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition text-xs"
              >
                Copy
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-200 border border-emerald-400/20">
                Secure Update
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-200 border border-indigo-400/20">
                Policy Checks
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/70 border border-white/10">
                Esc clears messages
              </span>
            </div>
          </div>

          <div className="px-8 py-7">
            {(msg || err) && (
              <div
                className={`mb-4 text-sm rounded-2xl px-4 py-3 border ${
                  err
                    ? "text-rose-100 bg-rose-500/10 border-rose-400/20"
                    : "text-emerald-100 bg-emerald-500/10 border-emerald-400/20"
                }`}
              >
                {msg || err}
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-sm text-white/80 mb-2">New Password</label>
                <div className="relative">
                  <input
                    ref={newRef}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type={showNew ? "text" : "password"}
                    placeholder="Enter new password"
                    required
                    className="w-full px-4 py-3 pr-16 rounded-2xl bg-black/25 border border-white/15 placeholder-white/35
                               focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition text-xs"
                    title="Toggle visibility (Ctrl/Cmd + K)"
                  >
                    {showNew ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span>Password strength</span>
                    <span className={`font-semibold ${strength.tone}`}>{strength.label}</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full rounded-full bg-white/10 border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-emerald-400 transition-all"
                      style={{ width: strength.width }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/80 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter password"
                    required
                    className="w-full px-4 py-3 pr-16 rounded-2xl bg-black/25 border border-white/15 placeholder-white/35
                               focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition text-xs"
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>

                {confirm.length > 0 && (
                  <p className={`mt-2 text-xs ${passwordsMatch ? "text-emerald-200" : "text-rose-200"}`}>
                    {passwordsMatch ? "Passwords match ✅" : "Passwords do not match ❌"}
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-white/75">Password policy</span>
                  <span className="text-xs text-white/55">Recommended</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <RuleItem ok={rules.length} label="8+ characters" />
                  <RuleItem ok={rules.upper} label="Uppercase" />
                  <RuleItem ok={rules.lower} label="Lowercase" />
                  <RuleItem ok={rules.number} label="Number" />
                  <RuleItem ok={rules.special} label="Special (optional)" />
                  <RuleItem ok={rules.common} label="Not common" />
                </div>

                <div className="mt-3 text-xs text-white/55">
                  Tip: Avoid using <span className="text-white/75">admin / password / 123456</span>.
                </div>
              </div>

              <button
                disabled={loading || !canSubmit}
                className={`w-full py-3.5 rounded-2xl text-base font-bold transition-all
                  ${
                    loading || !canSubmit
                      ? "bg-white/10 border border-white/10 text-white/55 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 hover:scale-[1.01] hover:shadow-[0_0_55px_rgba(217,70,239,0.30)]"
                  }`}
              >
                {loading ? "Updating..." : "Update Admin Password"}
              </button>

              <div className="flex items-center justify-between text-xs text-white/55">
                <span>Ctrl/Cmd + K toggles visibility</span>
                <button
                  type="button"
                  onClick={() => navigate("/admin/forgot-password", { state: { email } })}
                  className="hover:text-white/80 transition underline underline-offset-4 decoration-white/30 hover:decoration-white/70"
                >
                  Request new link
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/login")}
                className="w-full py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
              >
                Back to Admin Login
              </button>
            </form>
          </div>

          <div className="px-8 py-5 border-t border-white/10 bg-black/10">
            <p className="text-xs text-white/60">
              Security note: After updating, login again. If the link expired, request a new reset email.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/45 mt-5">TalentBridge • Admin Security</p>
      </div>
    </div>
  );
}

function RuleItem({ ok, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${ok ? "bg-emerald-400" : "bg-white/30"}`} />
      <span className={ok ? "text-white/85" : "text-white/60"}>{label}</span>
    </div>
  );
}