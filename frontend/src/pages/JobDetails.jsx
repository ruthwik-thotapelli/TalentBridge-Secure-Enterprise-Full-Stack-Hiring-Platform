import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobById, saveJob, applyForJob } from "../services/jobService";

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const jobId = useMemo(() => Number(id), [id]);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Apply Modal
  const [showApply, setShowApply] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Small UI toast (no alert)
  const [toast, setToast] = useState({ show: false, msg: "", type: "info" });

  // Form data
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    skills: "",
    coverNote: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState("");

  // ------------------ helpers ------------------
  const showToast = (msg, type = "info") => {
    setToast({ show: true, msg, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => {
      setToast((p) => ({ ...p, show: false }));
    }, 2200);
  };

  const toList = (val) => {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    return String(val)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ------------------ load job ------------------
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const data = await getJobById(jobId);
        setJob(data);

        const appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];
        const savedJobs = JSON.parse(localStorage.getItem("savedJobs")) || [];

        setApplied(appliedJobs.some((j) => j.id === jobId));
        setSaved(savedJobs.some((j) => j.id === jobId));

        const lastEmail = localStorage.getItem("lastApplicantEmail");
        if (lastEmail) setForm((p) => ({ ...p, email: lastEmail }));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [jobId]);

  // ------------------ actions ------------------
  const handleSave = async () => {
    if (!job) return;
    if (saved) return;

    await saveJob(job);
    setSaved(true);
    showToast("Saved successfully ✅", "success");
  };

  const openApply = () => {
    if (applied) return;
    setShowApply(true);
  };

  const closeApply = () => {
    setShowApply(false);
    setResumeFile(null);
    setResumeName("");
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const isPdf =
      f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      showToast("Upload PDF resume only.", "error");
      e.target.value = "";
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (f.size > maxBytes) {
      showToast("Resume must be below 2MB.", "error");
      e.target.value = "";
      return;
    }

    setResumeFile(f);
    setResumeName(f.name);
    showToast("Resume added ✅", "success");
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied 🔗", "success");
    } catch {
      showToast("Copy failed. Please copy manually.", "error");
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!job) return;

    if (!form.fullName.trim()) return showToast("Enter full name", "error");
    if (!form.email.trim()) return showToast("Enter email", "error");
    if (!form.phone.trim()) return showToast("Enter phone", "error");
    if (!resumeFile) return showToast("Upload your resume (PDF)", "error");

    setSubmitting(true);

    let resumeDataUrl = "";
    try {
      resumeDataUrl = await fileToBase64(resumeFile);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      showToast("Resume upload failed", "error");
      return;
    }

    localStorage.setItem("lastApplicantEmail", form.email.trim());

    await applyForJob({
      job,
      applicant: {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        linkedin: form.linkedin.trim(),
        skills: form.skills.trim(),
        coverNote: form.coverNote.trim(),
        resumeName: resumeName || "resume.pdf",
        resumeDataUrl,
      },
    });

    const appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];
    if (!appliedJobs.some((j) => j.id === job.id)) {
      appliedJobs.unshift({ id: job.id, title: job.title, company: job.company });
      localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs));
    }

    setApplied(true);
    setSubmitting(false);
    closeApply();
    showToast("Application submitted ✅", "success");
  };

  // ------------------ states ------------------
  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 px-6 text-white bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950">
        <div className="max-w-6xl mx-auto">
          <SkeletonTop />
          <div className="grid md:grid-cols-3 gap-10 mt-10">
            <div className="md:col-span-2 space-y-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <SkeletonCard className="h-[340px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white">
        Job Not Found
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 text-white bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950">
      <div className="max-w-6xl mx-auto">
        {/* Toast */}
        <Toast toast={toast} onClose={() => setToast((p) => ({ ...p, show: false }))} />

        {/* Header */}
        <div className={`${glass} p-10 mb-10`}>
          {/* Top bar */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <button
              onClick={() => navigate("/jobs")}
              className="w-fit px-6 py-3 rounded-2xl font-semibold
                         bg-white/[0.08] border border-white/10 backdrop-blur-xl
                         hover:bg-white/[0.14] hover:border-white/20 transition
                         shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
            >
              Back to Jobs
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="px-5 py-3 rounded-2xl font-semibold
                           bg-white/[0.08] border border-white/10
                           hover:bg-white/[0.14] hover:border-white/20 transition"
              >
                Share
              </button>

              <button
                onClick={handleSave}
                disabled={saved}
                className={`px-5 py-3 rounded-2xl font-semibold border transition
                  ${
                    saved
                      ? "opacity-60 cursor-not-allowed bg-white/10 border-white/10"
                      : "bg-white/[0.08] border-white/10 hover:bg-white/[0.14] hover:border-white/20"
                  }`}
              >
                {saved ? "Saved" : "Save Job"}
              </button>
            </div>
          </div>

          {/* Title block */}
          <div className="flex flex-col md:flex-row md:justify-between gap-10">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 leading-tight">
                {job.title}
              </h1>
              <p className="text-white/70 text-lg">
                {job.company} • {job.location}
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <Tag label={job.type} />
                <Tag label={job.experience} />
                <Tag label={job.salary || "Salary as per company norms"} />
              </div>

              {/* Quick overview mini cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl">
                <MiniStat title="Posted" value={job.posted || "Recently"} />
                <MiniStat title="Applicants" value={`${job.applicants || 0}+`} />
                <MiniStat title="Status" value={applied ? "Applied" : "Open"} />
              </div>

              {applied && (
                <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-emerald-200">
                  ✅ You already applied for this job.
                </div>
              )}
            </div>

            {/* Apply box */}
            <div className={`${glass} p-6 w-full md:w-80`}>
              <button
                onClick={openApply}
                disabled={applied}
                className={`w-full py-3 rounded-2xl text-lg font-semibold transition
                  ${
                    applied
                      ? "bg-emerald-500/40 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 shadow-[0_14px_50px_rgba(99,102,241,0.25)]"
                  }`}
              >
                {applied ? "Applied ✓" : "Apply Now"}
              </button>

              <p className="mt-4 text-sm text-white/60 leading-relaxed">
                Apply with your resume. Your application will be reviewed by admin.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Pill label="Fast process" />
                <Pill label="Resume required" />
                <Pill label="Secure apply" />
                <Pill label="Quick review" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-10">
            <Section title="About This Role">
              <p className="text-white/80 leading-relaxed">
                {job.about ||
                  `As a ${job.title}, you will contribute to building scalable products and collaborate with a strong engineering team.`}
              </p>
            </Section>

            <Section title="Key Responsibilities">
              <ul className="list-disc list-inside space-y-2 text-white/80">
                {toList(job.responsibilities).length ? (
                  toList(job.responsibilities).map((x, i) => <li key={i}>{x}</li>)
                ) : (
                  <>
                    <li>Develop features and deliver production-quality code</li>
                    <li>Write clean, maintainable components and APIs</li>
                    <li>Collaborate with team and follow best practices</li>
                  </>
                )}
              </ul>
            </Section>

            <Section title="Requirements">
              <ul className="list-disc list-inside space-y-2 text-white/80">
                {toList(job.requirements).length ? (
                  toList(job.requirements).map((x, i) => <li key={i}>{x}</li>)
                ) : (
                  <>
                    <li>Strong fundamentals and problem-solving</li>
                    <li>Good JavaScript understanding</li>
                    <li>REST APIs basics</li>
                    <li>Basic Git and teamwork</li>
                  </>
                )}
              </ul>
            </Section>

            <Section title="Good to Have">
              <ul className="list-disc list-inside space-y-2 text-white/80">
                {toList(job.goodToHave).length ? (
                  toList(job.goodToHave).map((x, i) => <li key={i}>{x}</li>)
                ) : (
                  <>
                    <li>Node.js basics</li>
                    <li>SQL basics</li>
                    <li>CI/CD awareness</li>
                  </>
                )}
              </ul>
            </Section>

            <Section title="Perks & Benefits">
              <ul className="list-disc list-inside space-y-2 text-white/80">
                {toList(job.perks).length ? (
                  toList(job.perks).map((x, i) => <li key={i}>{x}</li>)
                ) : (
                  <>
                    <li>Learning support</li>
                    <li>Flexible culture</li>
                    <li>Team mentorship</li>
                  </>
                )}
              </ul>
            </Section>
          </div>

          {/* Sidebar */}
          <div className={`${glass} p-8 h-fit sticky top-28`}>
            <h3 className="text-xl font-bold mb-4">Job Overview</h3>
            <InfoRow label="Company" value={job.company} />
            <InfoRow label="Location" value={job.location} />
            <InfoRow label="Job Type" value={job.type} />
            <InfoRow label="Experience" value={job.experience} />
            <InfoRow label="Salary" value={job.salary || "As per norms"} />

            <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-sm text-white/70 leading-relaxed">
                Tip: Keep your resume to 1 page + add GitHub and projects.
              </p>
            </div>

            <button
              onClick={openApply}
              disabled={applied}
              className={`mt-6 w-full py-3 rounded-2xl font-semibold transition
                ${
                  applied
                    ? "bg-emerald-500/40 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90"
                }`}
            >
              {applied ? "Applied ✓" : "Apply Now"}
            </button>
          </div>
        </div>
      </div>

      {/* APPLY MODAL */}
      {showApply && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
          <div className={`w-full max-w-2xl ${glass} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Apply for {job.title}</h2>
                <p className="text-xs text-white/60">
                  {job.company} • {job.location}
                </p>
              </div>
              <button
                onClick={closeApply}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white/80"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleApplySubmit}>
              <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Full Name *"
                    value={form.fullName}
                    onChange={(v) => setForm((p) => ({ ...p, fullName: v }))}
                    placeholder="Your name"
                  />
                  <Input
                    label="Email *"
                    value={form.email}
                    onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                    placeholder="you@gmail.com"
                    type="email"
                  />
                  <Input
                    label="Phone *"
                    value={form.phone}
                    onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
                    placeholder="+91 9xxxx xxxxx"
                  />
                  <Input
                    label="LinkedIn"
                    value={form.linkedin}
                    onChange={(v) => setForm((p) => ({ ...p, linkedin: v }))}
                    placeholder="linkedin.com/in/yourprofile"
                  />
                </div>

                <Input
                  label="Skills (comma separated)"
                  value={form.skills}
                  onChange={(v) => setForm((p) => ({ ...p, skills: v }))}
                  placeholder="React, JavaScript, Node.js"
                />

                <div>
                  <label className="text-sm text-white/70">Resume (PDF) *</label>
                  <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFile}
                      className="block w-full text-sm text-white/70
                                 file:mr-4 file:py-2 file:px-4
                                 file:rounded-xl file:border-0
                                 file:text-sm file:font-semibold
                                 file:bg-purple-600 file:text-white
                                 hover:file:bg-purple-700"
                    />
                    {resumeName ? (
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <p className="text-emerald-200">Uploaded: {resumeName}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setResumeFile(null);
                            setResumeName("");
                            showToast("Removed resume", "info");
                          }}
                          className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition text-white/80"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-white/50 mt-2">
                        Max size: 2MB • PDF only
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/70">Cover Note (optional)</label>
                  <textarea
                    rows={4}
                    value={form.coverNote}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, coverNote: e.target.value }))
                    }
                    placeholder="Write a short message..."
                    className="mt-2 w-full px-4 py-3 rounded-2xl text-sm resize-none
                               bg-white/10 border border-white/20
                               focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <p className="text-xs text-white/50">
                  Note: This is stored in localStorage for now (frontend demo).
                </p>
              </div>

              <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeApply}
                  className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 transition text-sm border border-white/10"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-6 py-3 rounded-2xl text-sm font-semibold transition
                    ${
                      submitting
                        ? "bg-purple-600/50 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90"
                    }`}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* UI helpers */
const glass =
  "rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.35)]";

const Tag = ({ label }) => (
  <span className="px-4 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-white/80">
    {label}
  </span>
);

const Pill = ({ label }) => (
  <span className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10 text-white/80 text-center">
    {label}
  </span>
);

const Section = ({ title, children }) => (
  <div className={`${glass} p-7`}>
    <h2 className="text-2xl font-bold mb-3">{title}</h2>
    <div className="text-white/80 leading-relaxed">{children}</div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between text-sm mb-3 text-white/70 gap-4">
    <span>{label}</span>
    <span className="font-medium text-white text-right">{value || "-"}</span>
  </div>
);

const MiniStat = ({ title, value }) => (
  <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-4">
    <p className="text-xs text-white/60">{title}</p>
    <p className="text-lg font-semibold mt-1">{value}</p>
  </div>
);

const Input = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label className="text-sm text-white/70">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-2 w-full px-4 py-3 rounded-2xl text-sm
                 bg-white/10 border border-white/20
                 focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
  </div>
);

const Toast = ({ toast, onClose }) => {
  if (!toast.show) return null;

  const style =
    toast.type === "success"
      ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
      : toast.type === "error"
      ? "border-red-400/20 bg-red-500/10 text-red-200"
      : "border-white/10 bg-white/10 text-white/80";

  return (
    <div className="fixed top-24 right-6 z-[60]">
      <div className={`rounded-2xl border px-4 py-3 shadow-xl ${style}`}>
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium">{toast.msg}</p>
          <button
            onClick={onClose}
            className="ml-2 px-2 py-1 rounded-xl bg-white/10 hover:bg-white/20 transition text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SkeletonTop = () => (
  <div className={`${glass} p-10`}>
    <div className="h-12 w-40 rounded-2xl bg-white/10 animate-pulse" />
    <div className="mt-6 h-10 w-3/4 rounded-2xl bg-white/10 animate-pulse" />
    <div className="mt-3 h-6 w-2/3 rounded-2xl bg-white/10 animate-pulse" />
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
      <div className="h-20 rounded-2xl bg-white/10 animate-pulse" />
      <div className="h-20 rounded-2xl bg-white/10 animate-pulse" />
      <div className="h-20 rounded-2xl bg-white/10 animate-pulse" />
    </div>
  </div>
);

const SkeletonCard = ({ className = "" }) => (
  <div className={`${glass} p-7 ${className}`}>
    <div className="h-6 w-1/2 rounded-xl bg-white/10 animate-pulse" />
    <div className="mt-4 h-4 w-full rounded-xl bg-white/10 animate-pulse" />
    <div className="mt-2 h-4 w-5/6 rounded-xl bg-white/10 animate-pulse" />
    <div className="mt-2 h-4 w-4/6 rounded-xl bg-white/10 animate-pulse" />
    <div className="mt-6 h-10 w-40 rounded-2xl bg-white/10 animate-pulse" />
  </div>
);

export default JobDetails;
