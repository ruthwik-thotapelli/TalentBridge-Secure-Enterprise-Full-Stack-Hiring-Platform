import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";

export default function ResetPassword() {
  const { search } = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(search);
  const token = params.get("token");
  const email = params.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const rules = useMemo(() => {
    const p = newPassword || "";
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /[0-9]/.test(p),
      special: /[^A-Za-z0-9]/.test(p),
    };
  }, [newPassword]);

  const strengthCount = Object.values(rules).filter(Boolean).length;
  const strengthLabel =
    strengthCount <= 2 ? "Weak" : strengthCount <= 4 ? "Medium" : "Strong";

  const passwordsMatch = newPassword.length > 0 && newPassword === confirm;

  const canSubmit =
    token &&
    email &&
    passwordsMatch &&
    rules.length &&
    rules.upper &&
    rules.lower &&
    rules.number;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!token || !email) {
      setErr("Invalid or expired reset link.");
      return;
    }
    if (!passwordsMatch) {
      setErr("Passwords do not match.");
      return;
    }
    if (!canSubmit) {
      setErr("Please enter a stronger password.");
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ token, email, newPassword });
      setMsg(res?.message || "Password updated successfully!");
      setTimeout(() => navigate("/login"), 1200);
    } catch (e2) {
      setErr(e2.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  const RuleItem = ({ ok, label }) => (
    <div className="flex items-center gap-2 text-xs">
      <span className={`h-2 w-2 rounded-full ${ok ? "bg-green-400" : "bg-white/30"}`} />
      <span className={ok ? "text-white/85" : "text-white/60"}>{label}</span>
    </div>
  );

  // Invalid link UI (same theme, no glass)
  if (!token || !email) {
    return (
      <div
        className="min-h-screen flex items-start justify-center
                   bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900
                   px-6 py-20 text-white"
      >
        <div className="w-full max-w-md bg-[#4b2a79] border border-white/15 rounded-3xl shadow-2xl px-10 py-10 mt-6 text-center">
          <h2 className="text-2xl font-extrabold mb-2">Invalid Link</h2>
          <p className="text-white/80 mb-6">
            This reset link is invalid or expired.
          </p>

          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full py-3 rounded-xl text-lg font-semibold
                       bg-gradient-to-r from-green-400 to-emerald-500
                       hover:scale-[1.02] transition"
          >
            Request New Link
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full mt-3 py-3 rounded-xl bg-white/15 border border-white/20 hover:bg-white/20 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-extrabold mb-2">Reset Password</h1>
          <p className="text-white/80">
            Create a strong new password for your account
          </p>
        </div>

        {/* Alerts */}
        {msg && (
          <div className="mb-5 text-sm text-green-200 bg-green-500/15 border border-green-500/25 rounded-xl px-4 py-3">
            {msg}
          </div>
        )}
        {err && (
          <div className="mb-5 text-sm text-red-200 bg-red-500/15 border border-red-500/25 rounded-xl px-4 py-3">
            {err}
          </div>
        )}

        <form onSubmit={submit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm mb-2 text-white/85">
              New Password
            </label>

            <div className="relative">
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                type={showNew ? "text" : "password"}
                required
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/15
                           border border-white/20 placeholder-white/50
                           focus:outline-none focus:ring-2 focus:ring-purple-300"
              />

              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm mb-2 text-white/85">
              Confirm Password
            </label>

            <div className="relative">
              <input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
                type={showConfirm ? "text" : "password"}
                required
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/15
                           border border-white/20 placeholder-white/50
                           focus:outline-none focus:ring-2 focus:ring-purple-300"
              />

              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? "🙈" : "👁"}
              </button>
            </div>

            {confirm.length > 0 && (
              <p className={`mt-2 text-xs ${passwordsMatch ? "text-green-200" : "text-red-200"}`}>
                {passwordsMatch ? "Passwords match ✅" : "Passwords do not match ❌"}
              </p>
            )}
          </div>

          {/* Strength box */}
          <div className="rounded-xl bg-white/10 border border-white/15 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/80">Password strength</span>
              <span
                className={`text-sm font-semibold ${
                  strengthLabel === "Strong"
                    ? "text-green-200"
                    : strengthLabel === "Medium"
                    ? "text-yellow-200"
                    : "text-red-200"
                }`}
              >
                {strengthLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <RuleItem ok={rules.length} label="8+ characters" />
              <RuleItem ok={rules.upper} label="Uppercase" />
              <RuleItem ok={rules.lower} label="Lowercase" />
              <RuleItem ok={rules.number} label="Number" />
              <RuleItem ok={rules.special} label="Special (optional)" />
            </div>
          </div>

          {/* Submit */}
          <button
            disabled={loading || !canSubmit}
            className={`w-full py-3 rounded-xl text-lg font-semibold
                       bg-gradient-to-r from-green-400 to-emerald-500
                       hover:scale-[1.02] transition
                       ${(loading || !canSubmit) ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Updating..." : "Set New Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full py-3 rounded-xl bg-white/15 border border-white/20 hover:bg-white/20 transition"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}
