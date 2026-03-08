import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser, logoutUser } from "../services/authService";
import api from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const token = localStorage.getItem("token");

  const [open, setOpen] = useState(false); // desktop profile dropdown
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // mobile menu
  const menuRef = useRef(null);
  const mobileMenuRef = useRef(null);

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

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };

    const esc = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);

    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const closeAllMenus = () => {
    setOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    closeAllMenus();
    navigate("/login");
  };

  const goAdmin = () => {
    closeAllMenus();
    const isAdmin = localStorage.getItem("admin") === "true";
    navigate(isAdmin ? "/admin/dashboard" : "/admin/login");
  };

  const initials = useMemo(() => {
    const name = user?.name || "";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [user]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/home"
            className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate"
            onClick={closeAllMenus}
          >
            TalentBridge
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              className="text-gray-700 hover:text-indigo-600 font-medium"
              to="/home"
            >
              Home
            </Link>
            <Link
              className="text-gray-700 hover:text-indigo-600 font-medium"
              to="/jobs"
            >
              Jobs
            </Link>
            <Link
              className="text-gray-700 hover:text-indigo-600 font-medium"
              to="/dashboard"
            >
              Dashboard
            </Link>

            {!token ? (
              <Link
                to="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold transition"
              >
                Login
              </Link>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full hover:bg-black/5 transition max-w-[260px]"
                  aria-haspopup="menu"
                  aria-expanded={open}
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white grid place-items-center font-bold shrink-0">
                    {initials}
                  </div>

                  <div className="text-left leading-tight min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {user?.name || "User"}
                    </div>
                    <div className="text-[12px] text-gray-500 truncate">
                      {user?.role ? user.role : "Member"}
                    </div>
                  </div>

                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    className="text-gray-600 shrink-0"
                  >
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
                        onClick={() => {
                          closeAllMenus();
                          navigate("/profile");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-800"
                      >
                        👤 Profile
                      </button>

                      <button
                        onClick={() => {
                          closeAllMenus();
                          navigate("/dashboard");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-800"
                      >
                        📊 Dashboard
                      </button>

                      <button
                        onClick={() => {
                          closeAllMenus();
                          navigate("/resume");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-800"
                      >
                        📄 Resume
                      </button>

                      <button
                        onClick={goAdmin}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-50 text-sm text-gray-800"
                      >
                        👑 Admin Login
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

          {/* Mobile Menu Button */}
          <div className="md:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-xl p-2 text-gray-700 hover:bg-black/5"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            {mobileMenuOpen && (
              <div className="absolute top-16 left-0 right-0 border-t border-black/5 bg-white shadow-lg px-4 py-4">
                <div className="flex flex-col gap-2">
                  <Link
                    to="/home"
                    onClick={closeAllMenus}
                    className="rounded-xl px-4 py-3 text-gray-800 hover:bg-gray-50 font-medium"
                  >
                    Home
                  </Link>

                  <Link
                    to="/jobs"
                    onClick={closeAllMenus}
                    className="rounded-xl px-4 py-3 text-gray-800 hover:bg-gray-50 font-medium"
                  >
                    Jobs
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={closeAllMenus}
                    className="rounded-xl px-4 py-3 text-gray-800 hover:bg-gray-50 font-medium"
                  >
                    Dashboard
                  </Link>

                  {!token ? (
                    <Link
                      to="/login"
                      onClick={closeAllMenus}
                      className="mt-2 w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold transition"
                    >
                      Login
                    </Link>
                  ) : (
                    <>
                      <div className="mt-2 rounded-2xl border border-black/10 bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white grid place-items-center font-bold shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {user?.name || "User"}
                            </div>
                            <div className="text-xs text-gray-500 break-all">
                              {user?.email || ""}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2">
                          <button
                            onClick={() => {
                              closeAllMenus();
                              navigate("/profile");
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-white text-sm text-gray-800"
                          >
                            👤 Profile
                          </button>

                          <button
                            onClick={() => {
                              closeAllMenus();
                              navigate("/resume");
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-white text-sm text-gray-800"
                          >
                            📄 Resume
                          </button>

                          <button
                            onClick={goAdmin}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-white text-sm text-gray-800"
                          >
                            👑 Admin Login
                          </button>

                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-sm text-red-600 font-semibold"
                          >
                            🚪 Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="h-16" />
    </>
  );
}

export default Navbar;