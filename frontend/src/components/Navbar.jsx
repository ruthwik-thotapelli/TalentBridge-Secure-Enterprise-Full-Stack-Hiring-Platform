import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser, logoutUser } from "../services/authService";
import api from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const token = localStorage.getItem("token");

  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // ✅ if token exists but user missing, fetch from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (token && !user) {
          const res = await api.get("/profile/me");
          setUser(res.data.user);
          localStorage.setItem("currentUser", JSON.stringify(res.data.user));
        }
      } catch (err) {
        logoutUser();
        setUser(null);
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setOpen(false);
    navigate("/login");
  };

  const initials = useMemo(() => {
    const name = user?.name || "";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [user]);

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          TalentBridge
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link className="text-gray-700 hover:text-indigo-600 font-medium" to="/home">
            Home
          </Link>
          <Link className="text-gray-700 hover:text-indigo-600 font-medium" to="/jobs">
            Jobs
          </Link>
          <Link className="text-gray-700 hover:text-indigo-600 font-medium" to="/dashboard">
            Dashboard
          </Link>

          {/* Auth */}
          {!token ? (
            <Link
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold transition"
            >
              Login
            </Link>
          ) : (
            <div className="relative" ref={menuRef}>
              {/* Avatar Button */}
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-black/5 transition"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white grid place-items-center font-bold">
                  {initials}
                </div>

                <div className="text-left leading-tight">
                  <div className="text-sm font-semibold text-gray-900">
                    {user?.name || "User"}
                  </div>
                  <div className="text-[12px] text-gray-500">
                    {user?.role ? user.role : "Member"}
                  </div>
                </div>

                <svg width="18" height="18" viewBox="0 0 24 24" className="text-gray-600">
                  <path
                    d="M6 9l6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-black/10 bg-white shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5">
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.name || "User"}
                    </div>
                    <div className="text-xs text-gray-500 break-all">
                      {user?.email || ""}
                    </div>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => { setOpen(false); navigate("/profile"); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-800"
                    >
                      👤 Profile
                    </button>
                    <button
                      onClick={() => { setOpen(false); navigate("/dashboard"); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-800"
                    >
                      📊 Dashboard
                    </button>
                    <button
                      onClick={() => { setOpen(false); navigate("/resume"); }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-800"
                    >
                      📄 Resume
                    </button>

                    <div className="h-px bg-black/5 my-2" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-sm text-red-600 font-semibold"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
