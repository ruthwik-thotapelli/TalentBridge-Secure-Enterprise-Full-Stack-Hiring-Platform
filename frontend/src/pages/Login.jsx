import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

import googleLogo from "../assets/GoogleF.png";
import githubLogo from "../assets/GithubF.png";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE =
    process.env.REACT_APP_API_URL ||
    "https://talentbridge-secure-enterprise-full-stack-hiring-production.up.railway.app";

  useEffect(() => {
    const state = location.state;

    if (state?.success) setSuccess(state.success);
    if (state?.email) setEmail(state.email);

    const params = new URLSearchParams(location.search);

    if (params.get("verified") === "1") {
      setSuccess("Email verified successfully ✅ Now you can login.");
    }

    if (location.search) {
      navigate("/login", { replace: true, state: state || {} });
    } else if (state?.success || state?.email) {
      navigate("/login", { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await loginUser(email.trim(), password.trim());

      // ✅ REDIRECT TO HOME PAGE
      navigate("/");

    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  const handleGithub = () => {
    window.location.href = `${API_BASE}/api/auth/github`;
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 px-4 sm:px-6 py-10 sm:py-16 lg:py-20 text-white overflow-x-hidden">

      <div className="w-full max-w-md bg-[#4b2a79] border border-white/15 rounded-3xl shadow-2xl px-5 sm:px-8 lg:px-10 py-8 sm:py-10 mt-4 sm:mt-6">

        <div className="text-center mb-7 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
            Welcome Back
          </h1>

          <p className="text-sm sm:text-base text-white/80">
            Login to continue to TalentBridge
          </p>
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

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

          <div>
            <label className="block text-sm mb-2 text-white/85">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-white/85">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/15 border border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-300"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>

            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-white/80">
              <input type="checkbox" className="accent-purple-300" />
              Remember me
            </label>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-purple-200 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-base font-semibold bg-gradient-to-r from-green-400 to-emerald-500 hover:scale-[1.02] transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="px-3 text-sm text-white/70">OR</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        <div className="space-y-3">

          <button
            onClick={handleGoogle}
            className="w-full py-3 rounded-xl bg-white text-slate-900 font-semibold flex items-center justify-center gap-3 hover:bg-slate-100 transition"
          >
            <img src={googleLogo} alt="Google" className="w-6 h-6" />
            Sign in with Google
          </button>

          <button
            onClick={handleGithub}
            className="w-full py-3 rounded-xl bg-white text-slate-900 font-semibold flex items-center justify-center gap-3 hover:bg-slate-100 transition"
          >
            <img src={githubLogo} alt="GitHub" className="w-6 h-6" />
            Sign in with GitHub
          </button>

        </div>

        <p className="text-center text-sm text-white/75 mt-7">
          Don’t have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="text-purple-200 hover:underline font-semibold"
          >
            Sign up
          </button>
        </p>

      </div>
    </div>
  );
};

export default Login;