import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getJobs, getApplications } from "../../services/jobService";

export default function AdminDashboard() {
  const nav = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(() => {
    const saved = localStorage.getItem("adminAutoRefresh");
    return saved ? saved === "true" : true;
  });

  const [quickStatus, setQuickStatus] = useState("All");
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

  const [notifSearch, setNotifSearch] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [jobsCount, setJobsCount] = useState(0);
  const [appsCount, setAppsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);
  const [inactiveJobs, setInactiveJobs] = useState(0);
  const [avgAts, setAvgAts] = useState(null);
  const [topAts, setTopAts] = useState(null);
  const [latestApps, setLatestApps] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);

  const [activity, setActivity] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("adminActivity") || "null");
    return saved || [];
  });

  const pushActivity = (text) => {
    const item = { id: Date.now(), text, at: new Date().toLocaleString() };
    setActivity((prev) => [item, ...prev].slice(0, 30));
  };

  const pushNotification = (text) => {
    setNotifications((prev) => [
      { id: Date.now(), text, read: false, at: new Date().toLocaleString() },
      ...prev,
    ]);
  };

  const load = async () => {
    try {
      setLoading(true);

      const jobs = (await getJobs()) || [];
      const apps = (await getApplications()) || [];

      setJobsCount(jobs.length);
      setAppsCount(apps.length);

      const active = jobs.filter((j) => (j.status || "Active") === "Active").length;
      setActiveJobs(active);
      setInactiveJobs(jobs.length - active);

      const pending = apps.filter((a) => a.status === "Pending").length;
      const shortlisted = apps.filter((a) => a.status === "Shortlisted").length;
      const accepted = apps.filter((a) => a.status === "Accepted").length;
      const rejected = apps.filter((a) => a.status === "Rejected").length;

      setPendingCount(pending);
      setShortlistedCount(shortlisted);
      setAcceptedCount(accepted);
      setRejectedCount(rejected);

      const atsList = apps
        .map((a) => (typeof a.atsScore === "number" ? a.atsScore : null))
        .filter((x) => x !== null);

      if (atsList.length) {
        const avg = Math.round(atsList.reduce((s, x) => s + x, 0) / atsList.length);
        const top = Math.max(...atsList);
        setAvgAts(avg);
        setTopAts(top);
      } else {
        setAvgAts(null);
        setTopAts(null);
      }

      const sortedLatest = [...apps].sort((a, b) => {
        const aT = new Date(a.appliedAt || 0).getTime();
        const bT = new Date(b.appliedAt || 0).getTime();
        return bT - aT;
      });
      setLatestApps(sortedLatest);

      const map = {};
      for (const a of apps) {
        const company = (a.company || "Unknown").trim() || "Unknown";
        map[company] = (map[company] || 0) + 1;
      }
      const leaderboard = Object.entries(map)
        .map(([company, count]) => ({ company, count }))
        .sort((x, y) => y.count - x.count)
        .slice(0, 5);
      setTopCompanies(leaderboard);

      const prevAppsCount = Number(localStorage.getItem("prevAppsCount") || "0");
      if (apps.length > prevAppsCount) {
        const diff = apps.length - prevAppsCount;
        pushNotification(`New applicant applied (${diff} new)`);
        pushActivity(`🔔 ${diff} new application(s) received`);
      }
      localStorage.setItem("prevAppsCount", String(apps.length));
    } catch (e) {
      console.error(e);
      alert("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("adminAutoRefresh", String(autoRefresh));
    if (!autoRefresh) return;

    const t = setInterval(() => load(), 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh]);

  useEffect(() => {
    localStorage.setItem("adminNotifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("adminActivity", JSON.stringify(activity));
  }, [activity]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("adminNotifications");
  };

  const clearActivity = () => {
    setActivity([]);
    localStorage.removeItem("adminActivity");
  };

  const filteredNotifications = useMemo(() => {
    const q = notifSearch.toLowerCase().trim();
    if (!q) return notifications;
    return notifications.filter((n) => (n.text || "").toLowerCase().includes(q));
  }, [notifications, notifSearch]);

  const latestFiltered = useMemo(() => {
    const list = latestApps || [];
    if (quickStatus === "All") return list.slice(0, 8);
    return list.filter((a) => (a.status || "Pending") === quickStatus).slice(0, 8);
  }, [latestApps, quickStatus]);

  const funnel = useMemo(() => {
    const total = appsCount || 1;
    const rejRate = Math.round((rejectedCount / total) * 100);
    const accRate = Math.round((acceptedCount / total) * 100);
    return { rejRate, accRate };
  }, [appsCount, rejectedCount, acceptedCount]);

  const todaysApps = useMemo(() => {
    const today = new Date().toLocaleDateString();
    return (latestApps || []).filter((a) => (a.appliedAt || "").includes(today)).length;
  }, [latestApps]);

  const system = { online: true, storage: "LocalStorage (demo)" };

  const closeSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-purple-950 text-white overflow-x-hidden lg:flex">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[280px] shrink-0 bg-white/10 backdrop-blur-xl border-r border-white/20 p-5 sm:p-6 transform transition-transform duration-300 lg:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 mb-8">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide">👑 Admin Panel</h2>
          <button
            onClick={closeSidebar}
            className="lg:hidden px-3 py-2 rounded-xl bg-white/10 border border-white/10"
          >
            ✕
          </button>
        </div>

        <nav className="space-y-3 text-white/80">
          <NavItem label="📊 Dashboard" onClick={() => { nav("/admin/dashboard"); closeSidebar(); }} />
          <NavItem label="💼 Manage Jobs" onClick={() => { nav("/admin/manage-jobs"); closeSidebar(); }} />
          <NavItem label="👥 Applicants" onClick={() => { nav("/admin/applicants"); closeSidebar(); }} />
          <NavItem label="⭐ Shortlisted" onClick={() => { nav("/admin/shortlisted"); closeSidebar(); }} />
        </nav>

        <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-sm font-semibold">⚙️ Auto Refresh</p>
          <p className="text-xs text-white/60 mt-1">Refresh every 20 seconds</p>
          <button
            onClick={() => {
              setAutoRefresh((v) => !v);
              pushActivity(`⚙️ Auto refresh turned ${!autoRefresh ? "ON" : "OFF"}`);
            }}
            className={`mt-3 w-full py-2 rounded-xl font-semibold transition ${
              autoRefresh
                ? "bg-green-500/20 text-green-200 border border-green-500/20 hover:bg-green-500/30"
                : "bg-white/10 text-white/80 border border-white/10 hover:bg-white/15"
            }`}
          >
            {autoRefresh ? "Enabled" : "Disabled"}
          </button>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("admin");
            nav("/admin/login");
            closeSidebar();
          }}
          className="mt-10 w-full py-2 rounded-xl text-red-300 border border-red-400/30 hover:bg-red-500/20 transition"
        >
          🚪 Logout
        </button>

        <div className="mt-6 text-xs text-white/50">
          <p>Storage: {system.storage}</p>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 lg:p-10 relative lg:ml-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden px-4 py-3 rounded-xl bg-white/10 border border-white/20"
            >
              ☰
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Admin Dashboard</h1>
              <p className="text-white/60 text-sm mt-1">Clean analytics + quick actions + notifications.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-xs sm:text-sm">
              {system.online ? "🟢 System Online" : "🔴 System Offline"}
            </div>

            <button onClick={() => setShowNotifications(true)} className="relative text-2xl" title="Notifications">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                pushActivity("🔄 Admin refreshed dashboard");
                load();
              }}
              disabled={loading}
              className={`px-4 sm:px-5 py-2 rounded-xl border transition text-sm font-semibold ${
                loading
                  ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
                  : "bg-white/10 border-white/20 hover:bg-white/15"
              }`}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="mb-8 sm:mb-10 rounded-2xl border border-white/15 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold">🚀 Today Overview</h2>
              <p className="text-white/60 text-sm mt-1">
                {todaysApps} new application(s) today • Active jobs: {activeJobs} • Shortlisted: {shortlistedCount}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <GlowButton
                label="Manage Jobs"
                onClick={() => {
                  pushActivity("➡️ Opened Manage Jobs");
                  nav("/admin/manage-jobs");
                }}
                tone="indigo"
              />
              <GlowButton
                label="Applicants"
                onClick={() => {
                  pushActivity("➡️ Opened Applicants");
                  nav("/admin/applicants");
                }}
                tone="emerald"
              />
              <GlowButton
                label="Shortlisted"
                onClick={() => {
                  pushActivity("➡️ Opened Shortlisted");
                  nav("/admin/shortlisted");
                }}
                tone="pink"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-8 mb-8 sm:mb-10">
          <StatCard title="Total Jobs" value={jobsCount} glow="purple" />
          <StatCard title="Applicants" value={appsCount} glow="pink" />
          <StatCard title="Shortlisted" value={shortlistedCount} glow="cyan" />
          <StatCard title="Pending" value={pendingCount} glow="yellow" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
          <MiniStat title="✅ Accepted" value={acceptedCount} tone="green" />
          <MiniStat title="❌ Rejected" value={rejectedCount} tone="red" />
          <MiniStat title="🟣 Active Jobs" value={activeJobs} tone="purple" />
          <MiniStat title="⚪ Inactive Jobs" value={inactiveJobs} tone="neutral" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-12">
          <InsightCard title="ATS Average" value={avgAts === null ? "—" : `${avgAts}/100`} sub="Across candidates with ATS" tone="cyan" />
          <InsightCard title="Top ATS Score" value={topAts === null ? "—" : `${topAts}/100`} sub="Best candidate score" tone="green" />
          <InsightCard title="Funnel Health" value={`${funnel.accRate}% Accepted`} sub={`${funnel.rejRate}% Rejected`} tone="yellow" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
          <QuickAction title="Manage Jobs" desc="Create / edit / deactivate jobs" icon="💼" onClick={() => nav("/admin/manage-jobs")} />
          <QuickAction title="Review Applicants" desc="Shortlist / accept / reject" icon="👀" onClick={() => nav("/admin/applicants")} />
          <QuickAction title="Shortlisted" desc="View shortlisted candidates" icon="⭐" onClick={() => nav("/admin/shortlisted")} />
          <QuickAction title="Coming Soon" desc="Email alerts, reports" icon="🧩" disabled />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col gap-4 mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold">🧾 Latest Applications</h2>
                <p className="text-xs text-white/60 mt-1">Use quick filters to focus on specific status.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterChip label="All" active={quickStatus === "All"} onClick={() => setQuickStatus("All")} />
                <FilterChip label="Pending" active={quickStatus === "Pending"} onClick={() => setQuickStatus("Pending")} />
                <FilterChip label="Shortlisted" active={quickStatus === "Shortlisted"} onClick={() => setQuickStatus("Shortlisted")} />
                <FilterChip label="Accepted" active={quickStatus === "Accepted"} onClick={() => setQuickStatus("Accepted")} />
                <FilterChip label="Rejected" active={quickStatus === "Rejected"} onClick={() => setQuickStatus("Rejected")} />
              </div>
            </div>

            {latestFiltered.length === 0 ? (
              <p className="text-white/60 text-sm">No applications found for this filter.</p>
            ) : (
              <div className="space-y-3">
                {latestFiltered.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{a.fullName || "Guest User"}</p>
                      <p className="text-xs text-white/60 truncate">{a.userEmail}</p>
                      <p className="text-xs text-white/50 break-words">
                        {a.jobTitle || "Job"} • {a.company || "Company"} • {a.appliedAt || ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs ${pill(a.status || "Pending")}`}>
                        {a.status || "Pending"}
                      </span>
                      {typeof a.atsScore === "number" && (
                        <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-200 border border-green-400/20 whitespace-nowrap">
                          ATS {a.atsScore}
                        </span>
                      )}
                      <button
                        onClick={() => nav("/admin/applicants")}
                        className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10 hover:bg-white/15 transition"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold">🏆 Top Companies</h2>
              <p className="text-xs text-white/60 mt-1">Companies with most applications</p>

              <div className="mt-4 space-y-3">
                {topCompanies.length === 0 ? (
                  <p className="text-white/60 text-sm">No data yet.</p>
                ) : (
                  topCompanies.map((c, idx) => (
                    <div key={c.company} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/20 flex items-center justify-center text-sm font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <p className="font-semibold truncate">{c.company}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10 whitespace-nowrap">
                        {c.count} apps
                      </span>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={() => nav("/admin/applicants")}
                className="mt-4 w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition"
              >
                View Applicants
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 sm:p-6 shadow-[0_0_40px_rgba(168,85,247,0.2)]">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h2 className="text-lg sm:text-xl font-bold">🕒 Activity</h2>
                <button
                  onClick={clearActivity}
                  className="text-sm px-4 py-2 rounded-xl bg-red-500/15 text-red-200 border border-red-400/20 hover:bg-red-500/25 transition"
                >
                  Clear
                </button>
              </div>

              {activity.length === 0 ? (
                <p className="text-white/60 text-sm">No activity yet.</p>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {activity.map((x) => (
                    <div key={x.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-sm">{x.text}</p>
                      <p className="text-xs text-white/50 mt-1">{x.at}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showNotifications && (
          <div className="fixed inset-0 bg-black/60 flex justify-end z-50">
            <div className="w-full sm:w-[420px] h-full bg-slate-900 border-l border-white/20 p-5 sm:p-6">
              <div className="flex justify-between items-center mb-4 gap-3">
                <h2 className="text-xl font-bold">🔔 Notifications</h2>
                <button onClick={() => setShowNotifications(false)}>✖</button>
              </div>

              <input
                value={notifSearch}
                onChange={(e) => setNotifSearch(e.target.value)}
                placeholder="Search notifications..."
                className="w-full mb-4 px-4 py-3 rounded-xl bg-white/10 border border-white/20
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <button
                  onClick={markAllRead}
                  className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm w-full sm:w-auto"
                >
                  Mark all read
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="px-4 py-2 rounded-xl bg-red-500/15 text-red-200 border border-red-400/20 hover:bg-red-500/25 transition text-sm w-full sm:w-auto"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
                {filteredNotifications.length === 0 && <p className="text-white/60 text-sm">No notifications</p>}

                {filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id);
                      pushActivity(`📩 Opened notification: ${n.text}`);
                    }}
                    className={`p-4 rounded-xl cursor-pointer border border-white/10 ${
                      n.read ? "bg-white/5 text-white/60" : "bg-purple-500/20"
                    }`}
                  >
                    <p className="text-sm">{n.text}</p>
                    <p className="text-xs text-white/50 mt-1">{n.at}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function NavItem({ label, onClick }) {
  return (
    <p onClick={onClick} className="cursor-pointer px-4 py-2 rounded-lg hover:bg-white/20 transition">
      {label}
    </p>
  );
}

function StatCard({ title, value, glow }) {
  const glowColor = {
    purple: "shadow-[0_0_40px_rgba(168,85,247,0.32)]",
    pink: "shadow-[0_0_40px_rgba(236,72,153,0.32)]",
    cyan: "shadow-[0_0_40px_rgba(34,211,238,0.32)]",
    yellow: "shadow-[0_0_40px_rgba(234,179,8,0.24)]",
  };

  return (
    <div className={`bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 sm:p-6 hover:scale-[1.03] transition ${glowColor[glow]}`}>
      <p className="text-white/70 mb-2 text-sm sm:text-base">{title}</p>
      <h3 className="text-3xl sm:text-4xl font-bold break-words">{value}</h3>
    </div>
  );
}

function MiniStat({ title, value, tone }) {
  const toneCls =
    tone === "green"
      ? "bg-green-500/15 text-green-200 border-green-400/20"
      : tone === "red"
      ? "bg-red-500/15 text-red-200 border-red-400/20"
      : tone === "neutral"
      ? "bg-white/5 text-white/80 border-white/10"
      : "bg-purple-500/15 text-purple-200 border-purple-400/20";

  return (
    <div className={`p-5 rounded-2xl border ${toneCls} backdrop-blur-xl`}>
      <p className="text-sm text-white/70">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 break-words">{value}</h3>
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

function InsightCard({ title, value, sub, tone }) {
  const toneCls =
    tone === "green"
      ? "border-green-400/20 bg-green-500/10"
      : tone === "cyan"
      ? "border-cyan-400/20 bg-cyan-500/10"
      : "border-yellow-400/20 bg-yellow-500/10";

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border ${toneCls} backdrop-blur-xl`}>
      <p className="text-sm text-white/70">{title}</p>
      <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 break-words">{value}</h3>
      <p className="text-xs text-white/60 mt-2">{sub}</p>
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
        active
          ? "bg-purple-500/25 text-purple-200 border-purple-400/25"
          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function GlowButton({ label, onClick, tone }) {
  const cls =
    tone === "emerald"
      ? "from-emerald-600 to-teal-500 shadow-emerald-500/20 hover:shadow-emerald-500/30"
      : tone === "pink"
      ? "from-fuchsia-600 to-pink-500 shadow-pink-500/20 hover:shadow-pink-500/30"
      : "from-indigo-600 to-purple-600 shadow-purple-500/20 hover:shadow-purple-500/30";

  return (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-xl font-semibold bg-gradient-to-r ${cls}
                  shadow-lg hover:opacity-95 active:scale-[0.98] transition`}
    >
      {label}
    </button>
  );
}

function pill(status) {
  if (status === "Accepted") return "bg-green-500/20 text-green-200 border border-green-400/20";
  if (status === "Rejected") return "bg-red-500/20 text-red-200 border border-red-400/20";
  if (status === "Shortlisted") return "bg-purple-500/20 text-purple-200 border border-purple-400/20";
  return "bg-yellow-500/20 text-yellow-200 border border-yellow-400/20";
}