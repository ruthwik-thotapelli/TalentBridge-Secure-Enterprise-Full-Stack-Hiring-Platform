import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "ruthwik@gmail.com" && password === "Ruthwik@123") {
      localStorage.setItem("admin", "true");
      navigate("/admin/dashboard");
    } else {
      setError("Access Denied • Invalid Admin Credentials");
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center
                 bg-gradient-to-br from-black via-slate-900 to-purple-950
                 text-white overflow-hidden"
    >
      {/* Background Glow Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl animate-pulse"></div>

      {/* Glass Card */}
      <div
        className="relative z-10 w-full max-w-md
                   bg-white/10 backdrop-blur-2xl
                   border border-white/20
                   rounded-3xl shadow-[0_0_80px_rgba(168,85,247,0.35)]
                   p-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">👑</div>
          <h1 className="text-3xl font-extrabold tracking-wide">Admin Portal</h1>
          <p className="text-white/70 mt-1">Authorized Personnel Only</p>
        </div>

        {/* Error */}
        {error && <div className="mb-4 text-sm text-red-400 text-center">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-1 text-white/70">Admin Email</label>
            <input
              type="email"
              placeholder="ruthwik@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl
                         bg-black/30 border border-white/20
                         placeholder-white/40
                         focus:outline-none focus:ring-2
                         focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-white/70">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl
                         bg-black/30 border border-white/20
                         placeholder-white/40
                         focus:outline-none focus:ring-2
                         focus:ring-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-lg font-bold
                       bg-gradient-to-r from-purple-500 via-pink-500 to-red-500
                       hover:scale-105 hover:shadow-[0_0_40px_rgba(236,72,153,0.6)]
                       transition-all duration-300"
          >
            Enter Admin Dashboard
          </button>
        </form>

        <p className="text-center text-xs text-white/50 mt-6">
          TalentBridge Secure Admin System
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
