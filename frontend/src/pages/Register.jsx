import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

import googleLogo from "../assets/GoogleF.png";
import githubLogo from "../assets/GithubF.png";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [agree, setAgree] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!agree) {
      setError("Please accept Terms & Conditions");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      // ✅ Backend message (verify email / resend verify)
      setSuccess(res?.message || "Account created! Please verify your email, then login.");

      // clear form
      setName("");
      setEmail("");
      setPassword("");
      setAgree(false);

      // ✅ Go to login page (user will verify then login)
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  const handleGithub = () => {
    window.location.href = "http://localhost:5000/api/auth/github";
  };

  return (
    <div
      className="min-h-screen flex items-start justify-center
                 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900
                 px-6 py-20 text-white"
    >
      <div className="w-full max-w-md bg-[#4b2a79] border border-white/15 rounded-3xl shadow-2xl px-10 py-10 mt-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2">Create Account</h1>
          <p className="text-white/80">Join TalentBridge and start your journey</p>
        </div>

        {success && (
          <div className="mb-5 text-sm text-green-200 bg-green-500/15 border border-green-500/25 rounded-xl px-4 py-3">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 text-sm text-red-200 bg-red-500/15 border border-red-500/25 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-2 text-white/85">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/15
                         border border-white/20 placeholder-white/50
                         focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-white/85">Email Address</label>
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
          </div>

          <div>
            <label className="block text-sm mb-2 text-white/85">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/15
                           border border-white/20 placeholder-white/50
                           focus:outline-none focus:ring-2 focus:ring-purple-300"
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                    <path d="M9.88 5.09A10.43 10.43 0 0 1 12 5c5 0 9.27 3.11 11 7-1 2.34-2.73 4.31-4.84 5.58" />
                    <path d="M6.61 6.61A13.53 13.53 0 0 0 1 12c1.73 3.89 6 7 11 7a10.43 10.43 0 0 0 2.12-.21" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="accent-purple-300"
            />
            I agree to the Terms & Conditions
          </label>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-lg font-semibold
                       bg-gradient-to-r from-green-400 to-emerald-500
                       hover:scale-[1.02] transition
                       ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="flex items-center my-7">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="px-3 text-sm text-white/70">OR</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogle}
            className="w-full py-3 rounded-xl bg-white text-slate-900
                       font-semibold flex items-center justify-center gap-3
                       hover:bg-slate-100 transition"
          >
            <img src={googleLogo} alt="Google" className="w-10 h-8" />
            Sign up with Google
          </button>

          <button
            type="button"
            onClick={handleGithub}
         className="w-full py-3 rounded-xl bg-white text-slate-900
                       font-semibold flex items-center justify-center gap-3
                       hover:bg-slate-100 transition"
          >
            <span className="">
              <img src={githubLogo} alt="GitHub" className="w-12 h-8" />
            </span>
            Sign up with GitHub
          </button>
        </div>

        <p className="text-center text-sm text-white/75 mt-7">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-purple-200 hover:underline font-semibold"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
};

export default Register;
