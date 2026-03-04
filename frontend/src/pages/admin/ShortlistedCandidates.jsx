import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplications, updateApplicationStatus } from "../../services/jobService";

export default function ShortlistedCandidates() {
  const navigate = useNavigate();

  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest | atsHigh | atsLow

  // ✅ NEW: refresh loading state
  const [refreshing, setRefreshing] = useState(false);

  // ✅ NEW: quick preview modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewApp, setPreviewApp] = useState(null);

  // ✅ NEW: selection + bulk actions
  const [selected, setSelected] = useState(new Set());

  const load = async () => {
    try {
      setRefreshing(true);

      const data = await getApplications();

      // load notes if you saved them in Applicants page
      const savedNotes = JSON.parse(localStorage.getItem("appNotes") || "{}");

      const shortlisted = (data || [])
        .filter((a) => a.status === "Shortlisted")
        .map((a) => ({ ...a, note: savedNotes[a.id] || a.note || "" }));

      setApps(shortlisted);
    } catch (e) {
      console.error(e);
      alert("Failed to load shortlisted candidates. Try again.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    try {
      const updated = await updateApplicationStatus(id, status);

      // re-filter shortlisted after update
      const savedNotes = JSON.parse(localStorage.getItem("appNotes") || "{}");
      const shortlisted = (updated || [])
        .filter((a) => a.status === "Shortlisted")
        .map((a) => ({ ...a, note: savedNotes[a.id] || a.note || "" }));

      setApps(shortlisted);

      // also remove from selection if selected
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (e) {
      console.error(e);
      alert("Failed to update status. Try again.");
    }
  };

  // ✅ Bulk update (from this page)
  const bulkSetStatus = async (status) => {
    if (selected.size === 0) return alert("Select at least 1 candidate.");
    try {
      // update one by one (your service returns full list)
      let updated = [];
      for (const id of selected) {
        updated = await updateApplicationStatus(id, status);
      }

      // keep only shortlisted after bulk action
      const savedNotes = JSON.parse(localStorage.getItem("appNotes") || "{}");
      const shortlisted = (updated || [])
        .filter((a) => a.status === "Shortlisted")
        .map((a) => ({ ...a, note: savedNotes[a.id] || a.note || "" }));

      setApps(shortlisted);
      setSelected(new Set());
    } catch (e) {
      console.error(e);
      alert("Bulk update failed. Try again.");
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => setSelected(new Set(filtered.map((a) => a.id)));
  const clearSelection = () => setSelected(new Set());

  const openPreview = (app) => {
    setPreviewApp(app);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewApp(null);
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
          {/* ✅ Updated: remove arrow + colorful premium button */}
          <button
            onClick={() => navigate("/admin/applicants")}
            className="px-6 py-3 rounded-xl font-semibold
                       bg-gradient-to-r from-sky-600 to-cyan-500
                       shadow-lg shadow-cyan-500/20
                       hover:from-sky-500 hover:to-cyan-400 hover:shadow-cyan-500/30
                       active:scale-[0.98] transition"
          >
            Back to Applicants
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-6 py-3 rounded-xl font-semibold
                         bg-gradient-to-r from-purple-600 to-indigo-600
                         shadow-lg shadow-purple-500/20
                         hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-500/30
                         active:scale-[0.98] transition"
            >
              Admin Dashboard
            </button>

            <button
              onClick={load}
              disabled={refreshing}
              className={`px-6 py-3 rounded-xl font-semibold border transition active:scale-[0.98]
                ${
                  refreshing
                    ? "bg-white/5 border-white/10 text-white/50 cursor-not-allowed"
                    : "bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30"
                }`}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:w-[760px]">
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

            {/* ✅ NEW: selection helper */}
            <button
              onClick={selectAllVisible}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 transition"
            >
              Select All Visible
            </button>
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

        {/* ✅ NEW: Bulk actions bar */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="text-white/70 text-sm">
            Selected: <b className="text-white">{selected.size}</b>
          </span>

          <button
            onClick={() => bulkSetStatus("Accepted")}
            className="px-4 py-2 rounded-xl bg-green-500/20 text-green-200 border border-green-500/20 hover:bg-green-500/30 transition text-sm"
          >
            Bulk Accept
          </button>

          <button
            onClick={() => bulkSetStatus("Rejected")}
            className="px-4 py-2 rounded-xl bg-red-500/20 text-red-200 border border-red-500/20 hover:bg-red-500/30 transition text-sm"
          >
            Bulk Reject
          </button>

          <button
            onClick={() => bulkSetStatus("Pending")}
            className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-200 border border-yellow-500/20 hover:bg-yellow-500/30 transition text-sm"
          >
            Bulk Move to Pending
          </button>

          <button
            onClick={clearSelection}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm"
          >
            Clear Selection
          </button>
        </div>

        {/* ✅ List */}
        <div className="space-y-4">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-5
                         hover:bg-white/[0.12] transition"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* ✅ NEW: selection checkbox */}
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selected.has(a.id)}
                      onChange={() => toggleSelect(a.id)}
                      className="w-4 h-4 accent-purple-500"
                      title="Select candidate"
                    />
                  </div>

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

                    {/* ✅ NEW: show more details if available */}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/70">
                      {a.phone && (
                        <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                          📞 {a.phone}
                        </span>
                      )}
                      {a.skills && (
                        <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                          🧠 {String(a.skills).slice(0, 40)}
                          {String(a.skills).length > 40 ? "..." : ""}
                        </span>
                      )}
                      {a.experience && (
                        <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                          💼 {a.experience}
                        </span>
                      )}
                    </div>

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
                  {/* ✅ NEW: quick preview button */}
                  <button
                    onClick={() => openPreview(a)}
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm"
                  >
                    Quick View
                  </button>

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

      {/* ✅ Quick View Modal */}
      {previewOpen && previewApp && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="w-[92%] max-w-2xl rounded-2xl bg-slate-950 border border-white/10 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Candidate Details</h3>
                <p className="text-white/60 text-sm mt-1">
                  Full information available for recruiter review.
                </p>
              </div>

              <button
                onClick={closePreview}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Full Name" value={previewApp.fullName || "—"} />
              <Info label="Email" value={previewApp.userEmail || "—"} />
              <Info label="Phone" value={previewApp.phone || "—"} />
              <Info label="LinkedIn" value={previewApp.linkedin || "—"} />
              <Info label="Job Title" value={previewApp.jobTitle || "—"} />
              <Info label="Company" value={previewApp.company || "—"} />
              <Info label="Applied At" value={previewApp.appliedAt || "—"} />
              <Info
                label="ATS Score"
                value={
                  typeof previewApp.atsScore === "number"
                    ? `${previewApp.atsScore}/100`
                    : "—"
                }
              />
            </div>

            {previewApp.skills && (
              <div className="mt-4">
                <p className="text-sm text-white/70">Skills</p>
                <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80">
                  {String(previewApp.skills)}
                </div>
              </div>
            )}

            {previewApp.note && (
              <div className="mt-4">
                <p className="text-sm text-white/70">Recruiter Notes</p>
                <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80">
                  {previewApp.note}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => openResume(previewApp.resumeDataUrl, previewApp.resumeName)}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm"
              >
                View Resume
              </button>

              <button
                onClick={() => updateStatus(previewApp.id, "Accepted")}
                className="px-4 py-2 rounded-xl bg-green-500/20 text-green-200 hover:bg-green-500/30 transition text-sm"
              >
                Mark Accepted
              </button>

              <button
                onClick={() => updateStatus(previewApp.id, "Rejected")}
                className="px-4 py-2 rounded-xl bg-red-500/20 text-red-200 hover:bg-red-500/30 transition text-sm"
              >
                Reject
              </button>

              <button
                onClick={() => updateStatus(previewApp.id, "Pending")}
                className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30 transition text-sm"
              >
                Move to Pending
              </button>
            </div>
          </div>
        </div>
      )}
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

function Info({ label, value }) {
  // if value looks like a link, show as anchor (optional)
  const isLink = typeof value === "string" && value.startsWith("http");
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <p className="text-xs text-white/60">{label}</p>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-indigo-300 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm text-white/85 break-words">{value}</p>
      )}
    </div>
  );
}
