import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, addJob, deleteJob, updateJob } from "../../services/jobService";

export default function ManageJobs() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
    status: "Active", // ✅ NEW
  });

  const load = async () => {
    const data = await getJobs();
    setJobs(data);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredJobs = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return jobs;
    return jobs.filter((j) => (j.title || "").toLowerCase().includes(q));
  }, [jobs, search]);

  const activeCount = useMemo(() => {
    return jobs.filter((j) => (j.status || "Active") === "Active").length;
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

      // these are used in JobDetails
      about:
        form.about.trim() ||
        `As a ${form.title.trim()}, you will contribute to building scalable products.`,
      responsibilities: toList(form.responsibilities).length
        ? toList(form.responsibilities)
        : ["Develop features", "Write clean code", "Collaborate with team"],
      requirements: toList(form.requirements).length
        ? toList(form.requirements)
        : ["Strong fundamentals", "Good communication", "Basic Git"],
      goodToHave: toList(form.goodToHave).length
        ? toList(form.goodToHave)
        : ["Node.js basics", "SQL basics"],
      perks: toList(form.perks).length
        ? toList(form.perks)
        : ["Learning support", "Flexible culture"],

      // optional fields
      status: form.status || "Active",
      posted: isEdit ? undefined : "Today",
      applicants: isEdit ? undefined : 0,
      description: "Job posted by admin.",
    };

    if (isEdit) await updateJob(payload);
    else await addJob(payload);

    setShowModal(false);
    resetForm();
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    await deleteJob(id);
    load();
  };

  // ✅ NEW: Toggle Active/Inactive
  const toggleStatus = async (job) => {
    const nextStatus = (job.status || "Active") === "Active" ? "Inactive" : "Active";
    const payload = { ...job, status: nextStatus };
    await updateJob(payload);
    load();
  };

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-black via-slate-900 to-purple-950 text-white">
      {/* Top */}
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-6 py-3 rounded-xl bg-purple-600/90 hover:bg-purple-700 transition font-semibold"
          >
            Back to Dashboard
          </button>

          {/* ✅ NEW quick links */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/admin/applicants")}
              className="px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition"
            >
              👥 Applicants
            </button>

            <button
              onClick={() => navigate("/admin/shortlisted")}
              className="px-5 py-3 rounded-xl bg-purple-500/20 border border-purple-400/20 hover:bg-purple-500/30 transition"
            >
              ⭐ Shortlisted
            </button>

            <button
              onClick={openAdd}
              className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95"
            >
              ➕ Add Job
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-extrabold">Manage Jobs</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Stat title="Total Jobs" value={jobs.length} />
          <Stat title="Active Jobs" value={activeCount} color="green" />
          <Stat title="Inactive Jobs" value={jobs.length - activeCount} color="red" />
        </div>

        {/* Search */}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search job title..."
          className="w-full mb-6 px-4 py-3 rounded-xl bg-white/10 border border-white/20
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* Table */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/10 border-b border-white/20">
              <tr>
                <th className="p-4 text-left">Job Title</th>
                <th className="p-4 text-left">Company</th>
                <th className="p-4 text-left">Applicants</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-white/10 hover:bg-white/5 transition"
                >
                  <td className="p-4">{job.title}</td>
                  <td className="p-4">{job.company}</td>

                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-sm bg-white/10 border border-white/10">
                      {(job.applicants || 0) + " applicants"}
                    </span>
                  </td>

                  <td className="p-4">
                    <span className={statusPill(job.status || "Active")}>
                      {job.status || "Active"}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {/* ✅ NEW view job */}
                      <button
                        onClick={() => navigate(`/jobs/${job.id}`)}
                        className="px-4 py-1 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 transition"
                      >
                        View
                      </button>

                      <button
                        onClick={() => openEdit(job)}
                        className="px-4 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition"
                      >
                        Edit
                      </button>

                      {/* ✅ NEW toggle */}
                      <button
                        onClick={() => toggleStatus(job)}
                        className="px-4 py-1 rounded-lg bg-purple-500/20 text-purple-200 hover:bg-purple-500/30 transition"
                      >
                        {job.status === "Inactive" ? "Activate" : "Deactivate"}
                      </button>

                      <button
                        onClick={() => handleDelete(job.id)}
                        className="px-4 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-white/70">
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Compact Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
          <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-white/20 shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {isEdit ? "Edit Job" : "Add New Job"}
              </h2>
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

            {/* Body scroll */}
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-3">
              {/* Basic fields */}
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

                {/* ✅ NEW status */}
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

              {/* Big details */}
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

              <p className="text-xs text-white/50">
                Tip: Use commas to create list items.
              </p>
            </div>

            {/* Footer */}
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
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-700 transition"
              >
                {isEdit ? "Update" : "Add"}
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
    color === "green"
      ? "text-green-400"
      : color === "red"
      ? "text-red-400"
      : "text-white";

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6">
      <p className="text-sm text-white/70">{title}</p>
      <h2 className={`text-4xl font-bold ${c}`}>{value}</h2>
    </div>
  );
}

function statusPill(status) {
  if (status === "Inactive")
    return "px-4 py-1 rounded-full text-sm bg-red-500/20 text-red-300 border border-red-500/20";
  return "px-4 py-1 rounded-full text-sm bg-green-500/20 text-green-300 border border-green-500/20";
}
