import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getJobs, getApplications } from "../../services/jobService";

export default function AdminDashboard() {
  const nav = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);

  // ✅ Notifications (demo)
  const [notifications, setNotifications] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("adminNotifications") || "null");
    return (
      saved || [
        { id: 1, text: "New applicant applied for a job", read: false, at: new Date().toLocaleString() },
        { id: 2, text: "Job status updated", read: false, at: new Date().toLocaleString() },
        { id: 3, text: "New job posted successfully", read: true, at: new Date().toLocaleString() },
      ]
    );
  });

  const [jobsCount, setJobsCount] = useState(0);
  const [appsCount, setAppsCount] = useState(0);

  // ✅ NEW counts
  const [pendingCount, setPendingCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  // ✅ Load jobs + applications
  const load = async () => {
    const jobs = await getJobs();
    const apps = await getApplications();

    setJobsCount(jobs.length);
    setAppsCount(apps.length);

    // Count by status
    const pending = apps.filter((a) => a.status === "Pending").length;
    const shortlisted = apps.filter((a) => a.status === "Shortlisted").length;
    const accepted = apps.filter((a) => a.status === "Accepted").length;
    const rejected = apps.filter((a) => a.status === "Rejected").length;

    setPendingCount(pending);
    setShortlistedCount(shortlisted);
    setAcceptedCount(accepted);
    setRejectedCount(rejected);

    // ✅ Demo: auto notification if new application count increased
    const prevAppsCount = Number(localStorage.getItem("prevAppsCount") || "0");
    if (apps.length > prevAppsCount) {
      pushNotification(`New applicant applied (${apps.length - prevAppsCount} new)`);
    }
    localStorage.setItem("prevAppsCount", String(apps.length));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save notifications
  useEffect(() => {
    localStorage.setItem("adminNotifications", JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = (id) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem("adminNotifications");
  };

  // ✅ NEW: Push notification helper
  const pushNotification = (text) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        text,
        read: false,
        at: new Date().toLocaleString(),
      },
      ...prev,
    ]);
  };

  // ✅ System status (demo)
  const system = {
    online: true,
    storage: "LocalStorage (demo)",
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-slate-900 to-purple-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 p-6">
        <h2 className="text-2xl font-extrabold mb-10 tracking-wide">
          👑 Admin Panel
        </h2>

        <nav className="space-y-4 text-white/80">
          <NavItem label="📊 Dashboard" onClick={() => nav("/admin/dashboard")} />
          <NavItem label="💼 Manage Jobs" onClick={() => nav("/admin/manage-jobs")} />
          <NavItem label="👥 Applicants" onClick={() => nav("/admin/applicants")} />
          {/* ✅ NEW */}
          <NavItem label="⭐ Shortlisted" onClick={() => nav("/admin/shortlisted")} />
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("admin");
            nav("/admin/login");
          }}
          className="mt-16 w-full py-2 rounded-lg text-red-400 border border-red-400/40 hover:bg-red-500/20 transition"
        >
          🚪 Logout
        </button>

        <div className="mt-6 text-xs text-white/50">
          <p>Storage: {system.storage}</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
            <p className="text-white/60 text-sm mt-1">
              Manage jobs, applicants, and shortlisted candidates.
            </p>
          </div>

          <div className="flex items-center gap-6">
            {/* System Status */}
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm animate-pulse">
              {system.online ? "🟢 System Online" : "🔴 System Offline"}
            </div>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative text-2xl"
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Refresh */}
            <button
              onClick={load}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <StatCard title="Total Jobs" value={jobsCount} glow="purple" />
          <StatCard title="Applicants" value={appsCount} glow="pink" />
          {/* ✅ NEW */}
          <StatCard title="Shortlisted" value={shortlistedCount} glow="cyan" />
          <StatCard title="Pending" value={pendingCount} glow="yellow" />
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <MiniStat title="✅ Accepted" value={acceptedCount} tone="green" />
          <MiniStat title="❌ Rejected" value={rejectedCount} tone="red" />
          <MiniStat title="⭐ Shortlisted" value={shortlistedCount} tone="purple" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <QuickAction
            title="Add New Job"
            desc="Post a new job opening"
            icon="➕"
            onClick={() => nav("/admin/manage-jobs")}
          />
          <QuickAction
            title="Review Applicants"
            desc="Shortlist / accept / reject"
            icon="👀"
            onClick={() => nav("/admin/applicants")}
          />
          {/* ✅ NEW */}
          <QuickAction
            title="Shortlisted"
            desc="View shortlisted candidates"
            icon="⭐"
            onClick={() => nav("/admin/shortlisted")}
          />
          <QuickAction title="View Analytics" desc="Coming soon" icon="📊" disabled />
        </div>

        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">🕒 Recent Activity</h2>
            <button
              onClick={() => {
                pushNotification("Admin refreshed dashboard");
                load();
              }}
              className="text-sm px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition"
            >
              + Log Refresh
            </button>
          </div>

          <ul className="space-y-3 text-white/80">
            <li>✔ Jobs stored in localStorage: <b>{jobsCount}</b></li>
            <li>👤 Applications stored in localStorage: <b>{appsCount}</b></li>
            <li>⭐ Shortlisted candidates: <b>{shortlistedCount}</b></li>
            <li>✅ Accepted: <b>{acceptedCount}</b> • ❌ Rejected: <b>{rejectedCount}</b></li>
            <li>🔄 Admin can shortlist/accept/reject from Applicants page</li>
          </ul>
        </div>

        {/* Notifications Drawer */}
        {showNotifications && (
          <div className="fixed inset-0 bg-black/60 flex justify-end z-50">
            <div className="w-96 h-full bg-slate-900 border-l border-white/20 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">🔔 Notifications</h2>
                <button onClick={() => setShowNotifications(false)}>✖</button>
              </div>

              <div className="space-y-3">
                {notifications.length === 0 && (
                  <p className="text-white/60 text-sm">No notifications</p>
                )}

                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-4 rounded-lg cursor-pointer border border-white/10 ${
                      n.read ? "bg-white/5 text-white/60" : "bg-purple-500/20"
                    }`}
                  >
                    <p>{n.text}</p>
                    <p className="text-xs text-white/50 mt-1">{n.at}</p>
                  </div>
                ))}
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="mt-6 w-full py-2 rounded-lg bg-red-500/20 text-red-400"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* Reusable Components */
function NavItem({ label, onClick }) {
  return (
    <p
      onClick={onClick}
      className="cursor-pointer px-4 py-2 rounded-lg hover:bg-white/20 transition"
    >
      {label}
    </p>
  );
}

function StatCard({ title, value, glow }) {
  const glowColor = {
    purple: "shadow-[0_0_40px_rgba(168,85,247,0.4)]",
    pink: "shadow-[0_0_40px_rgba(236,72,153,0.4)]",
    cyan: "shadow-[0_0_40px_rgba(34,211,238,0.4)]",
    yellow: "shadow-[0_0_40px_rgba(234,179,8,0.35)]",
  };

  return (
    <div
      className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:scale-[1.03] transition ${glowColor[glow]}`}
    >
      <p className="text-white/70 mb-2">{title}</p>
      <h3 className="text-4xl font-bold">{value}</h3>
    </div>
  );
}

function MiniStat({ title, value, tone }) {
  const toneCls =
    tone === "green"
      ? "bg-green-500/15 text-green-200 border-green-400/20"
      : tone === "red"
      ? "bg-red-500/15 text-red-200 border-red-400/20"
      : "bg-purple-500/15 text-purple-200 border-purple-400/20";

  return (
    <div className={`p-5 rounded-2xl border ${toneCls} backdrop-blur-xl`}>
      <p className="text-sm text-white/70">{title}</p>
      <h3 className="text-3xl font-extrabold mt-1">{value}</h3>
    </div>
  );
}

function QuickAction({ title, desc, icon, onClick, disabled }) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`p-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-white/20"
      } transition`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-sm text-white/70">{desc}</p>
    </div>
  );
}
