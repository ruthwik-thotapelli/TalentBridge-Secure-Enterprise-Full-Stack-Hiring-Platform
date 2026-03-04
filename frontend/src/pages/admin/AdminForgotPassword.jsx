import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { adminForgotPassword } from "../../services/authService";

export default function AdminForgotPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [email, setEmail] = useState(state?.email || "");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [toast, setToast] = useState("");

  const emailRef = useRef(null);

  const showToast = (m) => {
    setToast(m);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(""), 2000);
  };

  const emailOk = useMemo(() => {
    const v = email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }, [email]);

  const domain = useMemo(() => {
    const v = email.trim();
    const at = v.indexOf("@");
    if (at === -1) return "";
    return v.slice(at + 1).toLowerCase();
  }, [email]);

  const mailProviders = useMemo(() => {
    const providers = [
      { key: "gmail", label: "Open Gmail", url: "https://mail.google.com" },
      { key: "outlook", label: "Open Outlook", url: "https://outlook.live.com/mail/" },
      { key: "yahoo", label: "Open Yahoo Mail", url: "https://mail.yahoo.com" },
    ];

    if (domain.includes("gmail")) return [providers[0], providers[1], providers[2]];
    if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live"))
      return [providers[1], providers[0], providers[2]];
    if (domain.includes("yahoo")) return [providers[2], providers[0], providers[1]];
    return providers;
  }, [domain]);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setErr("");
        setMsg("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = async (e) => {
    e?.preventDefault?.();
    setErr("");
    setMsg("");

    if (!emailOk) {
      setErr("Please enter a valid admin email address.");
      emailRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await adminForgotPassword(email.trim());
      setMsg(res?.message || "Reset link sent. Please check your inbox (and spam).");
      setCooldown(30);
      showToast("Email sent ✅");
    } catch (e2) {
      setErr(e2.response?.data?.message || "Failed to send admin reset link");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setMsg("");
    setErr("");
    setCooldown(0);
    showToast("Cleared ✅");
    emailRef.current?.focus();
  };

  const copyMsg = async () => {
    const text = msg || err || "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied ✅");
    } catch {
      showToast("Copy failed");
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
                onClick={() => navigate("/admin/login")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/10
                           hover:bg-white/15 hover:border-white/20 transition text-xs text-white/80"
              >
                <span className="h-2 w-2 rounded-full bg-white/60" />
                Back to Admin Login
              </button>

              <button
                type="button"
                onClick={() => showToast("Tip: Check spam/promotions tab")}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/5 border border-white/10
                           hover:bg-white/10 transition text-xs text-white/70"
              >
                💬 Need help?
              </button>
            </div>

            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs tracking-widest text-white/60">TALENTBRIDGE • ADMIN</p>
                <h1 className="text-3xl font-extrabold mt-2">Password Recovery</h1>
                <p className="text-sm text-white/70 mt-1">
                  We’ll send a secure reset link to your admin email.
                </p>
              </div>

              <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-pink-500 grid place-items-center shadow-lg shadow-fuchsia-500/20">
                <span className="text-xl">🔑</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-200 border border-emerald-400/20">
                Secure Link
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-200 border border-indigo-400/20">
                Admin Only
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/70 border border-white/10">
                Rate-limited
              </span>
            </div>
          </div>

          <div className="px-8 py-7">
            {(err || msg) && (
              <div
                className={`mb-4 text-sm rounded-2xl px-4 py-3 border ${
                  err
                    ? "text-rose-100 bg-rose-500/10 border-rose-400/20"
                    : "text-emerald-100 bg-emerald-500/10 border-emerald-400/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="leading-relaxed">{err || msg}</span>
                  <button
                    type="button"
                    onClick={copyMsg}
                    className="shrink-0 px-3 py-1 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}

            {!msg ? (
              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label className="block text-sm text-white/80 mb-2">Admin Email</label>
                  <div className="relative">
                    <input
                      ref={emailRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-black/25 border border-white/15 placeholder-white/35
                                 focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-white/20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/60">
                      {email.length ? (emailOk ? "✅" : "⚠️") : "✉️"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/55">
                    We’ll send a secure link. Check <span className="text-white/75">Spam/Promotions</span> if not found.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !emailOk}
                  className={`w-full py-3.5 rounded-2xl text-base font-bold transition-all
                    ${
                      loading || !emailOk
                        ? "bg-white/10 border border-white/10 text-white/55 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-pink-500 hover:scale-[1.01] hover:shadow-[0_0_55px_rgba(217,70,239,0.30)]"
                    }`}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="flex items-center justify-between text-xs text-white/55">
                  <span>Tip: Press Esc to clear messages</span>
                  <button
                    type="button"
                    onClick={clear}
                    className="hover:text-white/80 transition"
                  >
                    Clear
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-4">
                  <p className="text-sm font-semibold text-white/85">Next steps</p>
                  <div className="mt-2 space-y-2 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                      Open your email inbox
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                      Click the reset link
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-300" />
                      Set a new password and login
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {mailProviders.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => window.open(p.url, "_blank")}
                      className="w-full py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition font-semibold"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={submit}
                  disabled={loading || cooldown > 0}
                  className={`w-full py-3.5 rounded-2xl text-base font-bold transition-all
                    ${
                      loading || cooldown > 0
                        ? "bg-white/10 border border-white/10 text-white/55 cursor-not-allowed"
                        : "bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 hover:scale-[1.01]"
                    }`}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : loading ? "Resending..." : "Resend Email"}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={clear}
                    className="w-full py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
                  >
                    Try different email
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/login")}
                    className="w-full py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
                  >
                    Back to login
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-5 border-t border-white/10 bg-black/10">
            <p className="text-xs text-white/60">
              Security note: If you request repeatedly, the server may temporarily block requests.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/45 mt-5">TalentBridge • Admin Recovery</p>
      </div>
    </div>
  );
}