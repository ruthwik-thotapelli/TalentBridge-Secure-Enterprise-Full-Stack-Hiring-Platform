import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplications, updateApplicationStatus } from "../../services/jobService";

export default function Applicants() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  // ✅ NEW: selection (bulk actions)
  const [selected, setSelected] = useState(new Set());

  // ✅ NEW: notes modal
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteId, setNoteId] = useState(null);
  const [noteText, setNoteText] = useState("");

  const load = async () => {
    const data = await getApplications();

    // ✅ Load notes from localStorage
    const savedNotes = JSON.parse(localStorage.getItem("appNotes") || "{}");

    const withNotes = (data || []).map((a) => ({
      ...a,
      note: savedNotes[a.id] || a.note || "",
    }));

    setApps(withNotes);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return (apps || []).filter((a) => {
      const okStatus = filter === "All" || a.status === filter;
      const okSearch =
        !q ||
        (a.userEmail || "").toLowerCase().includes(q) ||
        (a.fullName || "").toLowerCase().includes(q) ||
        (a.jobTitle || "").toLowerCase().includes(q) ||
        (a.company || "").toLowerCase().includes(q);
      return okStatus && okSearch;
    });
  }, [apps, filter, search]);

  const count = (status) => (apps || []).filter((a) => a.status === status).length;

  // ✅ Update status (single)
  const setStatus = async (id, status) => {
    const updated = await updateApplicationStatus(id, status);
    setApps(updated);
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // ✅ Bulk update
  const bulkSetStatus = async (status) => {
    if (selected.size === 0) return alert("Select at least 1 candidate.");
    let updated = apps;

    for (const id of selected) {
      updated = await updateApplicationStatus(id, status);
    }

    setApps(updated);
    setSelected(new Set());
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    const ids = filtered.map((a) => a.id);
    setSelected(new Set(ids));
  };

  const clearSelection = () => setSelected(new Set());

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

  // ✅ NOTES
  const openNotes = (app) => {
    setNoteId(app.id);
    setNoteText(app.note || "");
    setNoteOpen(true);
  };

  const saveNotes = () => {
    if (!noteId) return;
    const savedNotes = JSON.parse(localStorage.getItem("appNotes") || "{}");
    savedNotes[noteId] = noteText;
    localStorage.setItem("appNotes", JSON.stringify(savedNotes));

    setApps((prev) => prev.map((a) => (a.id === noteId ? { ...a, note: noteText } : a)));
    setNoteOpen(false);
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-black via-slate-900 to-purple-950 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-6 py-3 rounded-xl bg-purple-600/90 hover:bg-purple-700 transition font-semibold"
          >
            Back to Dashboard
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/admin/shortlisted")}
              className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition font-semibold"
            >
              View Shortlisted →
            </button>

            <button
              onClick={load}
              className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Applicants</h1>
            <p className="text-white/60 text-sm">
              View applications, shortlist, accept, reject, add notes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:w-[520px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name/email/job..."
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Shortlisted</option>
              <option>Accepted</option>
              <option>Rejected</option>
            </select>

            <button
              onClick={selectAllVisible}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 transition"
            >
              Select All Visible
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Stat title="Pending" value={count("Pending")} color="yellow" />
          <Stat title="Shortlisted" value={count("Shortlisted")} color="purple" />
          <Stat title="Accepted" value={count("Accepted")} color="green" />
          <Stat title="Rejected" value={count("Rejected")} color="red" />
        </div>

        {/* Bulk actions */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="text-white/70 text-sm">
            Selected: <b className="text-white">{selected.size}</b>
          </span>

          <button
            onClick={() => bulkSetStatus("Shortlisted")}
            className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-200 border border-purple-500/20 hover:bg-purple-500/30 transition text-sm"
          >
            Bulk Shortlist
          </button>

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
            onClick={clearSelection}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm"
          >
            Clear Selection
          </button>
        </div>

        {/* Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/10 border-b border-white/20">
              <tr>
                <th className="p-4 text-left">Select</th>
                <th className="p-4 text-left">Candidate</th>
                <th className="p-4 text-left">Job</th>
                <th className="p-4 text-left">Company</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selected.has(a.id)}
                      onChange={() => toggleSelect(a.id)}
                      className="w-4 h-4 accent-purple-500"
                    />
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-500/30 flex items-center justify-center font-bold">
                        {(a.fullName || a.userEmail || "U")[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{a.fullName || "Guest User"}</p>
                        <p className="text-xs text-white/60">{a.userEmail}</p>
                        <p className="text-xs text-white/40">{a.appliedAt}</p>

                        {/* Optional ATS Score if exists */}
                        {typeof a.atsScore === "number" && (
                          <p className="text-xs mt-1 text-green-200">
                            ATS: <b className="text-green-300">{a.atsScore}</b>/100
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            onClick={() => openResume(a.resumeDataUrl, a.resumeName)}
                            className="px-3 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/15 border border-white/20 transition"
                          >
                            View Resume
                          </button>

                          <button
                            onClick={() => openNotes(a)}
                            className="px-3 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/15 border border-white/20 transition"
                          >
                            Notes
                          </button>

                          {a.linkedin && (
                            <a
                              href={a.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1 rounded-lg text-xs bg-white/10 hover:bg-white/15 border border-white/20 transition"
                            >
                              LinkedIn
                            </a>
                          )}
                        </div>

                        {a.note && (
                          <p className="text-xs text-white/60 mt-2">
                            📝 <span className="text-white/70">{a.note}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-4">{a.jobTitle}</td>
                  <td className="p-4">{a.company}</td>

                  <td className="p-4">
                    <span className={`px-4 py-1 rounded-full text-sm ${statusPill(a.status)}`}>
                      {a.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setStatus(a.id, "Shortlisted")}
                        className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition"
                      >
                        Shortlist
                      </button>

                      <button
                        onClick={() => setStatus(a.id, "Accepted")}
                        className="px-4 py-2 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition"
                      >
                        Accept
                      </button>

                      <button
                        onClick={() => setStatus(a.id, "Rejected")}
                        className="px-4 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-white/60">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-white/40 mt-4">
          Demo mode: Applications & Notes stored in localStorage. Backend API can be added later.
        </p>
      </div>

      {/* Notes Modal */}
      {noteOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="w-[92%] max-w-xl rounded-2xl bg-slate-950 border border-white/10 p-6">
            <h3 className="text-xl font-bold">Candidate Notes</h3>
            <p className="text-white/60 text-sm mt-1">
              Add internal recruiter notes (stored in browser for now).
            </p>

            <textarea
              rows={6}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full mt-4 rounded-xl bg-white/10 border border-white/10 p-4 text-white outline-none"
              placeholder="Write notes..."
            />

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setNoteOpen(false)}
                className="px-5 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition font-semibold"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Helpers */
function statusPill(status) {
  if (status === "Accepted") return "bg-green-500/20 text-green-300";
  if (status === "Rejected") return "bg-red-500/20 text-red-300";
  if (status === "Shortlisted") return "bg-purple-500/20 text-purple-200";
  return "bg-yellow-500/20 text-yellow-300";
}

function Stat({ title, value, color }) {
  const c =
    color === "green"
      ? "text-green-300"
      : color === "red"
      ? "text-red-300"
      : color === "purple"
      ? "text-purple-200"
      : "text-yellow-300";

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
      <p className="text-sm text-white/70">{title}</p>
      <h2 className={`text-4xl font-bold ${c}`}>{value}</h2>
    </div>
  );
}
