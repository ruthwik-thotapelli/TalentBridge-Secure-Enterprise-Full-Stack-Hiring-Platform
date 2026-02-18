import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplications, updateApplicationStatus } from "../../services/jobService";

export default function ShortlistedCandidates() {
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest | atsHigh | atsLow

  const load = async () => {
    const data = await getApplications();

    // load notes if you saved them in Applicants page
    const savedNotes = JSON.parse(localStorage.getItem("appNotes") || "{}");

    const shortlisted = (data || [])
      .filter((a) => a.status === "Shortlisted")
      .map((a) => ({ ...a, note: savedNotes[a.id] || a.note || "" }));

    setApps(shortlisted);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    let list = (apps || []).filter((a) => {
      if (!q) return true;
      return (
        (a.userEmail || "").toLowerCase().includes(q) ||
        (a.fullName || "").toLowerCase().includes(q) ||
        (a.jobTitle || "").toLowerCase().includes(q) ||
        (a.company || "").toLowerCase().includes(q)
      );
    });

    // sort
    list = [...list].sort((a, b) => {
      const aTime = new Date(a.appliedAt || 0).getTime();
      const bTime = new Date(b.appliedAt || 0).getTime();

      const aAts = typeof a.atsScore === "number" ? a.atsScore : -1;
      const bAts = typeof b.atsScore === "number" ? b.atsScore : -1;

      if (sort === "newest") return bTime - aTime;
      if (sort === "oldest") return aTime - bTime;
      if (sort === "atsHigh") return bAts - aAts;
      if (sort === "atsLow") return aAts - bAts;
      return 0;
    });

    return list;
  }, [apps, search, sort]);

  const openResume = (dataUrl, name = "resume.pdf") => {
    if (!dataUrl) return alert("No resume uploaded");
    const w = window.open();
    if (!w) return alert("Popup blocked. Allow popups to view resume.");
    w.document.title = name;
    w.document.body.style.margin = "0";
    w.document.body.innerHTML = `
      <iframe src="${dataUrl}" style="border:0;width:100%;height:100vh;"></iframe>
    `;
  };

  const updateStatus = async (id, status) => {
    const updated = await updateApplicationStatus(id, status);

    // re-filter shortlisted after update
    const savedNotes = JSON.parse(localStorage.getItem("appNotes") || "{}");
    const shortlisted = (updated || [])
      .filter((a) => a.status === "Shortlisted")
      .map((a) => ({ ...a, note: savedNotes[a.id] || a.note || "" }));

    setApps(shortlisted);
  };

  const stats = {
    total: apps.length,
    withAts: apps.filter((a) => typeof a.atsScore === "number").length,
    avgAts:
      apps.filter((a) => typeof a.atsScore === "number").length === 0
        ? null
        : Math.round(
            apps
              .filter((a) => typeof a.atsScore === "number")
              .reduce((sum, a) => sum + a.atsScore, 0) /
              apps.filter((a) => typeof a.atsScore === "number").length
          ),
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-black via-slate-900 to-purple-950 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={() => navigate("/admin/applicants")}
            className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition font-semibold"
          >
            ← Back to Applicants
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-3 rounded-xl bg-purple-600/90 hover:bg-purple-700 transition font-semibold"
            >
              Admin Dashboard
            </button>

            <button
              onClick={load}
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Shortlisted Candidates</h1>
            <p className="text-white/60 text-sm">
              Candidates marked as <b>Shortlisted</b> from Applicants page.
            </p>
          </div>

          {/* Search / sort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:w-[520px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name/email/job/company..."
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="atsHigh">Sort: ATS High → Low</option>
              <option value="atsLow">Sort: ATS Low → High</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Stat title="Total Shortlisted" value={stats.total} tone="purple" />
          <Stat title="ATS Available" value={stats.withAts} tone="green" />
          <Stat
            title="Avg ATS Score"
            value={stats.avgAts === null ? "—" : `${stats.avgAts}/100`}
            tone="yellow"
          />
        </div>

        {/* List */}
        <div className="space-y-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5
                         hover:bg-white/[0.12] transition"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/30 flex items-center justify-center font-bold text-lg">
                    {(a.fullName || a.userEmail || "U")[0]?.toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold">{a.fullName || "Guest User"}</h3>
                    <p className="text-sm text-white/70">{a.userEmail}</p>

                    <p className="text-sm text-white/70 mt-1">
                      <b>{a.jobTitle}</b> • {a.company}
                    </p>

                    <p className="text-xs text-white/50 mt-1">{a.appliedAt}</p>

                    {a.note && (
                      <p className="text-xs text-white/70 mt-2">
                        📝 <span className="text-white/80">{a.note}</span>
                      </p>
                    )}

                    {typeof a.atsScore === "number" && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-400/20 text-xs text-green-200">
                        ATS: <b className="text-green-300">{a.atsScore}/100</b>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button
                    onClick={() => openResume(a.resumeDataUrl, a.resumeName)}
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm"
                  >
                    View Resume
                  </button>

                  {a.linkedin && (
                    <a
                      href={a.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm"
                    >
                      LinkedIn
                    </a>
                  )}

                  <button
                    onClick={() => updateStatus(a.id, "Accepted")}
                    className="px-4 py-2 rounded-xl bg-green-500/20 text-green-200 hover:bg-green-500/30 transition text-sm"
                  >
                    Mark Accepted
                  </button>

                  <button
                    onClick={() => updateStatus(a.id, "Rejected")}
                    className="px-4 py-2 rounded-xl bg-red-500/20 text-red-200 hover:bg-red-500/30 transition text-sm"
                  >
                    Reject
                  </button>

                  <button
                    onClick={() => updateStatus(a.id, "Pending")}
                    className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30 transition text-sm"
                  >
                    Move to Pending
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="px-4 py-1 rounded-full text-sm bg-purple-500/20 text-purple-200">
                  Shortlisted
                </span>

                <span className="text-xs text-white/50">
                  ID: {a.id} {a.resumeName ? `• ${a.resumeName}` : ""}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="rounded-2xl bg-white/10 border border-white/20 p-6 text-white/60">
              No shortlisted candidates found.
            </div>
          )}
        </div>

        <p className="text-xs text-white/40 mt-4">
          Demo mode: data comes from your existing jobService (localStorage). Backend API can be connected later.
        </p>
      </div>
    </div>
  );
}

function Stat({ title, value, tone }) {
  const c =
    tone === "green"
      ? "text-green-300"
      : tone === "yellow"
      ? "text-yellow-300"
      : "text-purple-200";

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
      <p className="text-sm text-white/70">{title}</p>
      <h2 className={`text-4xl font-bold ${c}`}>{value}</h2>
    </div>
  );
}
