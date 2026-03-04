import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, addJob, deleteJob, updateJob } from "../../services/jobService";

export default function ManageJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");

  // ✅ Filters + selection + loading
  const [statusFilter, setStatusFilter] = useState("All"); // All | Active | Inactive
  const [typeFilter, setTypeFilter] = useState("All"); // All | Full Time | Part Time | Internship | Remote
  const [companyFilter, setCompanyFilter] = useState("All");
  const [selected, setSelected] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Pagination (10 per page)
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  // ✅ Modal (add/edit)
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // ✅ Job details modal
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsJob, setDetailsJob] = useState(null);

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "Full Time",
    experience: "0-2 Years",
    about: "",
    responsibilities: "",
    requirements: "",
    goodToHave: "",
    perks: "",
    status: "Active",
  });

  const load = async () => {
    try {
      setRefreshing(true);
      const data = await getJobs();
      setJobs(data || []);
    } catch (e) {
      console.error(e);
      alert("Failed to load jobs. Try again.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ✅ Company list for filter dropdown
  const uniqueCompanies = useMemo(() => {
    const set = new Set((jobs || []).map((j) => (j.company || "").trim()).filter(Boolean));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [jobs]);

  // ✅ Filtered jobs
  const filteredJobs = useMemo(() => {
    const q = search.toLowerCase().trim();

    const list = (jobs || []).filter((j) => {
      const titleOk = !q || (j.title || "").toLowerCase().includes(q);

      const s = j.status || "Active";
      const statusOk = statusFilter === "All" || s === statusFilter;

      const t = j.type || "Full Time";
      const typeOk = typeFilter === "All" || t === typeFilter;

      const c = (j.company || "").trim();
      const companyOk = companyFilter === "All" || c === companyFilter;

      return titleOk && statusOk && typeOk && companyOk;
    });

    return list;
  }, [jobs, search, statusFilter, typeFilter, companyFilter]);

  // ✅ Reset page when filters/search change
  useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [search, statusFilter, typeFilter, companyFilter]);

  // ✅ Pagination derived data
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  }, [filteredJobs.length]);

  const paginatedJobs = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredJobs.slice(start, start + PAGE_SIZE);
  }, [filteredJobs, page]);

  const activeCount = useMemo(() => {
    return (jobs || []).filter((j) => (j.status || "Active") === "Active").length;
  }, [jobs]);

  const resetForm = () => {
    setForm({
      title: "",
      company: "",
      location: "",
      salary: "",
      type: "Full Time",
      experience: "0-2 Years",
      about: "",
      responsibilities: "",
      requirements: "",
      goodToHave: "",
      perks: "",
      status: "Active",
    });
    setIsEdit(false);
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (job) => {
    setIsEdit(true);
    setEditingId(job.id);

    setForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "",
      salary: job.salary || "",
      type: job.type || "Full Time",
      experience: job.experience || "0-2 Years",
      about: job.about || "",
      responsibilities: Array.isArray(job.responsibilities)
        ? job.responsibilities.join(", ")
        : job.responsibilities || "",
      requirements: Array.isArray(job.requirements)
        ? job.requirements.join(", ")
        : job.requirements || "",
      goodToHave: Array.isArray(job.goodToHave)
        ? job.goodToHave.join(", ")
        : job.goodToHave || "",
      perks: Array.isArray(job.perks) ? job.perks.join(", ") : job.perks || "",
      status: job.status || "Active",
    });

    setShowModal(true);
  };

  const toList = (text) =>
    (text || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSave = async () => {
    if (!form.title.trim() || !form.company.trim()) {
      alert("Title and Company are required!");
      return;
    }

    const payload = {
      id: isEdit ? editingId : Date.now(),
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim() || "India",
      salary: form.salary.trim() || "Salary not disclosed",
      type: form.type,
      experience: form.experience,

      about:
        form.about.trim() ||
        `As a ${form.title.trim()}, you will contribute to building scalable products.`,
      responsibilities: toList(form.responsibilities).length
        ? toList(form.responsibilities)
        : ["Develop features", "Write clean code", "Collaborate with team"],
      requirements: toList(form.requirements).length
        ? toList(form.requirements)
        : ["Strong fundamentals", "Good communication", "Basic Git"],
      goodToHave: toList(form.goodToHave).length ? toList(form.goodToHave) : ["Node.js basics", "SQL basics"],
      perks: toList(form.perks).length ? toList(form.perks) : ["Learning support", "Flexible culture"],

      status: form.status || "Active",
      posted: isEdit ? undefined : "Today",
      applicants: isEdit ? undefined : 0,
      description: "Job posted by admin.",
    };

    try {
      if (isEdit) await updateJob(payload);
      else await addJob(payload);

      setShowModal(false);
      resetForm();
      load();
    } catch (e) {
      console.error(e);
      alert("Failed to save job. Try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await deleteJob(id);
      load();
    } catch (e) {
      console.error(e);
      alert("Delete failed. Try again.");
    }
  };

  const toggleStatus = async (job) => {
    try {
      const nextStatus = (job.status || "Active") === "Active" ? "Inactive" : "Active";
      await updateJob({ ...job, status: nextStatus });
      load();
    } catch (e) {
      console.error(e);
      alert("Failed to toggle status.");
    }
  };

  // ✅ Duplicate Job (clone)
  const duplicateJob = async (job) => {
    try {
      const copy = {
        ...job,
        id: Date.now(),
        title: `${job.title || "Job"} (Copy)`,
        posted: "Today",
        applicants: 0,
        status: job.status || "Active",
      };
      await addJob(copy);
      load();
    } catch (e) {
      console.error(e);
      alert("Duplicate failed.");
    }
  };

  // ✅ Selection
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => setSelected(new Set(paginatedJobs.map((j) => j.id)));
  const clearSelection = () => setSelected(new Set());

  // ✅ Bulk actions
  const bulkSetStatus = async (status) => {
    if (selected.size === 0) return alert("Select at least 1 job.");
    try {
      for (const id of selected) {
        const job = jobs.find((j) => j.id === id);
        if (!job) continue;
        await updateJob({ ...job, status });
      }
      setSelected(new Set());
      load();
    } catch (e) {
      console.error(e);
      alert("Bulk action failed.");
    }
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return alert("Select at least 1 job.");
    if (!window.confirm(`Delete ${selected.size} job(s)?`)) return;
    try {
      for (const id of selected) {
        await deleteJob(id);
      }
      setSelected(new Set());
      load();
    } catch (e) {
      console.error(e);
      alert("Bulk delete failed.");
    }
  };

  // ✅ Export CSV (exports filtered jobs)
  const exportCSV = () => {
    const rows = (filteredJobs || []).map((j) => ({
      id: j.id ?? "",
      title: j.title ?? "",
      company: j.company ?? "",
      location: j.location ?? "",
      salary: j.salary ?? "",
      type: j.type ?? "",
      experience: j.experience ?? "",
      status: j.status ?? "Active",
      applicants: j.applicants ?? 0,
      posted: j.posted ?? "",
    }));

    const headers = Object.keys(rows[0] || {
      id: "",
      title: "",
      company: "",
      location: "",
      salary: "",
      type: "",
      experience: "",
      status: "",
      applicants: "",
      posted: "",
    });

    const escape = (v) => {
      const s = String(v ?? "");
      if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobs_export_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // ✅ Details modal
  const openDetails = (job) => {
    setDetailsJob(job);
    setDetailsOpen(true);
  };
  const closeDetails = () => {
    setDetailsOpen(false);
    setDetailsJob(null);
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-black via-slate-900 to-purple-950 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Top */}
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-6 py-3 rounded-xl font-semibold
                       bg-gradient-to-r from-indigo-600 to-purple-600
                       shadow-lg shadow-purple-500/20
                       hover:from-indigo-500 hover:to-purple-500 hover:shadow-purple-500/30
                       active:scale-[0.98] transition"
          >
            Back to Dashboard
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/admin/applicants")}
              className="px-5 py-3 rounded-xl font-semibold
                         bg-gradient-to-r from-emerald-600 to-teal-500
                         shadow-lg shadow-emerald-500/20
                         hover:from-emerald-500 hover:to-teal-400 hover:shadow-emerald-500/30
                         active:scale-[0.98] transition"
            >
              Applicants
            </button>

            <button
              onClick={() => navigate("/admin/shortlisted")}
              className="px-5 py-3 rounded-xl font-semibold
                         bg-gradient-to-r from-fuchsia-600 to-pink-500
                         shadow-lg shadow-pink-500/20
                         hover:from-fuchsia-500 hover:to-pink-400 hover:shadow-pink-500/30
                         active:scale-[0.98] transition"
            >
              Shortlisted
            </button>

            <button
              onClick={openAdd}
              className="px-6 py-3 rounded-xl font-semibold
                         bg-gradient-to-r from-amber-500 to-orange-500
                         shadow-lg shadow-orange-500/20
                         hover:from-amber-400 hover:to-orange-400 hover:shadow-orange-500/30
                         active:scale-[0.98] transition"
            >
              Add Job
            </button>

            <button
              onClick={exportCSV}
              className="px-6 py-3 rounded-xl font-semibold
                         bg-gradient-to-r from-sky-600 to-cyan-500
                         shadow-lg shadow-cyan-500/20
                         hover:from-sky-500 hover:to-cyan-400 hover:shadow-cyan-500/30
                         active:scale-[0.98] transition"
            >
              Export CSV
            </button>

            <button
              onClick={load}
              disabled={refreshing}
              className={`px-6 py-3 rounded-xl font-semibold border transition active:scale-[0.98]
                ${
                  refreshing
                    ? "bg-white/5 border-white/10 text-white/50 cursor-not-allowed"
                    : "bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30"
                }`}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Header + Filters */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Manage Jobs</h1>
            <p className="text-white/60 text-sm mt-1">
              Filters • Bulk actions • Pagination • Export CSV • Duplicate job
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:w-[820px]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job title..."
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
            >
              <option value="All">Status: All</option>
              <option value="Active">Status: Active</option>
              <option value="Inactive">Status: Inactive</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
            >
              <option value="All">Type: All</option>
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Internship</option>
              <option>Remote</option>
            </select>

            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 focus:outline-none"
            >
              {uniqueCompanies.map((c) => (
                <option key={c} value={c}>
                  {c === "All" ? "Company: All" : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Stat title="Total Jobs" value={jobs.length} />
          <Stat title="Active Jobs" value={activeCount} color="green" />
          <Stat title="Inactive Jobs" value={jobs.length - activeCount} color="red" />
        </div>

        {/* Bulk actions */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className="text-white/70 text-sm">
            Selected: <b className="text-white">{selected.size}</b>
          </span>

          <button
            onClick={selectAllVisible}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm"
          >
            Select Page
          </button>

          <button
            onClick={clearSelection}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm"
          >
            Clear
          </button>

          <button
            onClick={() => bulkSetStatus("Active")}
            className="px-4 py-2 rounded-xl bg-green-500/20 text-green-200 border border-green-500/20 hover:bg-green-500/30 transition text-sm"
          >
            Bulk Activate
          </button>

          <button
            onClick={() => bulkSetStatus("Inactive")}
            className="px-4 py-2 rounded-xl bg-red-500/20 text-red-200 border border-red-500/20 hover:bg-red-500/30 transition text-sm"
          >
            Bulk Deactivate
          </button>

          <button
            onClick={bulkDelete}
            className="px-4 py-2 rounded-xl bg-rose-500/20 text-rose-200 border border-rose-500/20 hover:bg-rose-500/30 transition text-sm"
          >
            Bulk Delete
          </button>
        </div>

        {/* ✅ TABLE WRAP FIX: overflow-x-auto + no-wrap pills */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] table-auto">
              <thead className="bg-white/10 border-b border-white/20">
                <tr>
                  <th className="p-4 text-left w-[80px]">Select</th>
                  <th className="p-4 text-left">Job Title</th>
                  <th className="p-4 text-left">Company</th>
                  <th className="p-4 text-left w-[140px]">Type</th>
                  <th className="p-4 text-left w-[160px]">Applicants</th>
                  <th className="p-4 text-left w-[140px]">Status</th>
                  <th className="p-4 text-left w-[420px]">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedJobs.map((job) => (
                  <tr key={job.id} className="border-b border-white/10 hover:bg-white/5 transition">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selected.has(job.id)}
                        onChange={() => toggleSelect(job.id)}
                        className="w-4 h-4 accent-purple-500"
                      />
                    </td>

                    <td className="p-4">
                      <div className="font-semibold">{job.title}</div>
                      <div className="text-xs text-white/60 whitespace-nowrap">
                        {job.location || "India"} • {job.experience || "0-2 Years"}
                      </div>
                    </td>

                    <td className="p-4">{job.company}</td>

                    {/* ✅ FIX: no wrap */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/10 border border-white/10 whitespace-nowrap">
                        {job.type || "Full Time"}
                      </span>
                    </td>

                    {/* ✅ FIX: no wrap */}
                    <td className="p-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-white/10 border border-white/10 whitespace-nowrap">
                        {(job.applicants || 0)} Applicants
                      </span>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      <span className={statusPill(job.status || "Active")}>{job.status || "Active"}</span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="px-4 py-2 rounded-xl font-semibold
                                     bg-gradient-to-r from-sky-600 to-cyan-500
                                     hover:from-sky-500 hover:to-cyan-400 transition"
                        >
                          View
                        </button>

                        <button
                          onClick={() => openDetails(job)}
                          className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition"
                        >
                          Details
                        </button>

                        <button
                          onClick={() => openEdit(job)}
                          className="px-4 py-2 rounded-xl font-semibold
                                     bg-gradient-to-r from-indigo-600 to-blue-500
                                     hover:from-indigo-500 hover:to-blue-400 transition"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => duplicateJob(job)}
                          className="px-4 py-2 rounded-xl font-semibold
                                     bg-gradient-to-r from-amber-500 to-orange-500
                                     hover:from-amber-400 hover:to-orange-400 transition"
                        >
                          Duplicate
                        </button>

                        <button
                          onClick={() => toggleStatus(job)}
                          className="px-4 py-2 rounded-xl font-semibold
                                     bg-gradient-to-r from-purple-600 to-fuchsia-600
                                     hover:from-purple-500 hover:to-fuchsia-500 transition"
                        >
                          {job.status === "Inactive" ? "Activate" : "Deactivate"}
                        </button>

                        <button
                          onClick={() => handleDelete(job.id)}
                          className="px-4 py-2 rounded-xl font-semibold
                                     bg-gradient-to-r from-rose-600 to-red-600
                                     hover:from-rose-500 hover:to-red-500 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {paginatedJobs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-white/70">
                      No jobs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ Pagination controls */}
        <div className="mt-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-white/60">
            Showing{" "}
            <b className="text-white">
              {filteredJobs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
            </b>{" "}
            -{" "}
            <b className="text-white">
              {Math.min(page * PAGE_SIZE, filteredJobs.length)}
            </b>{" "}
            of <b className="text-white">{filteredJobs.length}</b> jobs
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-xl border transition
                ${page === 1 ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed" : "bg-white/10 border-white/20 hover:bg-white/15"}`}
            >
              Prev
            </button>

            <span className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-sm whitespace-nowrap">
              Page <b>{page}</b> / <b>{totalPages}</b>
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-xl border transition
                ${page === totalPages ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed" : "bg-white/10 border-white/20 hover:bg-white/15"}`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
          <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-white/20 shadow-2xl">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold">{isEdit ? "Edit Job" : "Add New Job"}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white/70 hover:text-white"
              >
                ✖
              </button>
            </div>

            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  placeholder="Job title *"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <input
                  placeholder="Company *"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <input
                  placeholder="Salary"
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option>Full Time</option>
                  <option>Part Time</option>
                  <option>Internship</option>
                  <option>Remote</option>
                </select>

                <select
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20
                             focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option>Fresher</option>
                  <option>0-2 Years</option>
                  <option>1-3 Years</option>
                  <option>2-4 Years</option>
                  <option>4+ Years</option>
                </select>

                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20
                             focus:outline-none focus:ring-2 focus:ring-purple-500 md:col-span-2"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <textarea
                rows={3}
                placeholder="About this role"
                value={form.about}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm resize-none bg-white/10 border border-white/20
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                placeholder="Responsibilities (comma separated)"
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                placeholder="Requirements (comma separated)"
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                placeholder="Good to Have (comma separated)"
                value={form.goodToHave}
                onChange={(e) => setForm({ ...form, goodToHave: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <input
                placeholder="Perks & Benefits (comma separated)"
                value={form.perks}
                onChange={(e) => setForm({ ...form, perks: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20
                           focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <p className="text-xs text-white/50">Tip: Use commas to create list items.</p>
            </div>

            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-sm font-semibold
                           bg-gradient-to-r from-purple-600 to-indigo-600
                           hover:from-purple-500 hover:to-indigo-500 transition"
              >
                {isEdit ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {detailsOpen && detailsJob && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50">
          <div className="w-full max-w-2xl bg-slate-950 rounded-2xl border border-white/10 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Job Details</h3>
                <p className="text-white/60 text-sm mt-1">Quick view for admin.</p>
              </div>

              <button
                onClick={closeDetails}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Info label="Title" value={detailsJob.title || "—"} />
              <Info label="Company" value={detailsJob.company || "—"} />
              <Info label="Location" value={detailsJob.location || "—"} />
              <Info label="Salary" value={detailsJob.salary || "—"} />
              <Info label="Type" value={detailsJob.type || "—"} />
              <Info label="Experience" value={detailsJob.experience || "—"} />
              <Info label="Status" value={detailsJob.status || "Active"} />
              <Info label="Applicants" value={`${detailsJob.applicants || 0}`} />
            </div>

            {detailsJob.about && <Section title="About" text={detailsJob.about} />}

            <div className="mt-5 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => navigate(`/jobs/${detailsJob.id}`)}
                className="px-4 py-2 rounded-xl font-semibold
                           bg-gradient-to-r from-sky-600 to-cyan-500
                           hover:from-sky-500 hover:to-cyan-400 transition"
              >
                Open Job Page
              </button>

              <button
                onClick={() => openEdit(detailsJob)}
                className="px-4 py-2 rounded-xl font-semibold
                           bg-gradient-to-r from-indigo-600 to-blue-500
                           hover:from-indigo-500 hover:to-blue-400 transition"
              >
                Edit Job
              </button>

              <button
                onClick={() => duplicateJob(detailsJob)}
                className="px-4 py-2 rounded-xl font-semibold
                           bg-gradient-to-r from-amber-500 to-orange-500
                           hover:from-amber-400 hover:to-orange-400 transition"
              >
                Duplicate
              </button>

              <button
                onClick={() => toggleStatus(detailsJob)}
                className="px-4 py-2 rounded-xl font-semibold
                           bg-gradient-to-r from-purple-600 to-fuchsia-600
                           hover:from-purple-500 hover:to-fuchsia-500 transition"
              >
                {detailsJob.status === "Inactive" ? "Activate" : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Small Components ---------- */

function Stat({ title, value, color }) {
  const c =
    color === "green" ? "text-green-400" : color === "red" ? "text-red-400" : "text-white";

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
      <p className="text-sm text-white/70">{title}</p>
      <h2 className={`text-4xl font-bold ${c}`}>{value}</h2>
    </div>
  );
}

function statusPill(status) {
  if (status === "Inactive") {
    return "inline-flex whitespace-nowrap px-4 py-1 rounded-full text-sm bg-red-500/20 text-red-300 border border-red-500/20";
  }
  return "inline-flex whitespace-nowrap px-4 py-1 rounded-full text-sm bg-green-500/20 text-green-300 border border-green-500/20";
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
      <p className="text-xs text-white/60">{label}</p>
      <p className="text-sm text-white/85 break-words">{value}</p>
    </div>
  );
}

function Section({ title, text }) {
  return (
    <div className="mt-4">
      <p className="text-sm text-white/70">{title}</p>
      <div className="mt-2 p-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80">
        {text}
      </div>
    </div>
  );
}
