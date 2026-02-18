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

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const data = await getJobById(jobId);
      setJob(data);

      const appliedJobs = JSON.parse(localStorage.getItem("appliedJobs")) || [];
      const savedJobs = JSON.parse(localStorage.getItem("savedJobs")) || [];

      setApplied(appliedJobs.some((j) => j.id === jobId));
      setSaved(savedJobs.some((j) => j.id === jobId));

      const lastEmail = localStorage.getItem("lastApplicantEmail");
      if (lastEmail) setForm((p) => ({ ...p, email: lastEmail }));

      setLoading(false);
    };

    load();
  }, [jobId]);

  const toList = (val) => {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    return String(val)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleSave = async () => {
    await saveJob(job);
    setSaved(true);
    alert("Job Saved ✅");
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
      alert("Please upload PDF resume only.");
      e.target.value = "";
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (f.size > maxBytes) {
      alert("Resume too large. Please upload below 2MB.");
      e.target.value = "";
      return;
    }

    setResumeFile(f);
    setResumeName(f.name);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!job) return;

    if (!form.fullName.trim()) return alert("Enter full name");
    if (!form.email.trim()) return alert("Enter email");
    if (!form.phone.trim()) return alert("Enter phone");
    if (!resumeFile) return alert("Upload your resume (PDF)");

    setSubmitting(true);

    const fileToBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    let resumeDataUrl = "";
    try {
      resumeDataUrl = await fileToBase64(resumeFile);
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      alert("Resume upload failed");
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
    alert("Applied Successfully ✅");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950">
        Loading...
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
        {/* Header */}
        <div className={`${glass} p-10 mb-10`}>
          <button
            onClick={() => navigate("/jobs")}
            className="mb-6 px-5 py-2 rounded-full text-sm bg-white/10 border border-white/10 hover:bg-white/20 transition"
          >
            Back to Jobs
          </button>

          <div className="flex flex-col md:flex-row md:justify-between gap-8">
            <div>
              <h1 className="text-4xl font-extrabold mb-2">{job.title}</h1>
              <p className="text-white/70 text-lg">
                {job.company} • {job.location}
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <Tag label={job.type} />
                <Tag label={job.experience} />
                <Tag label={job.salary || "Salary as per company norms"} />
              </div>
            </div>

            <div className={`${glass} p-6 w-full md:w-80`}>
              <button
                onClick={openApply}
                disabled={applied}
                className={`w-full py-3 rounded-xl text-lg font-semibold transition
                  ${
                    applied
                      ? "bg-emerald-500/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-400 to-emerald-500 hover:opacity-90"
                  }`}
              >
                {applied ? "Applied ✓" : "Apply Now"}
              </button>

              <button
                onClick={handleSave}
                disabled={saved}
                className={`w-full mt-3 py-3 rounded-xl font-semibold transition border border-white/10
                  ${
                    saved
                      ? "bg-white/10 opacity-60 cursor-not-allowed"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
              >
                {saved ? "Saved 💾" : "Save Job ⭐"}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-10">
            <Section title="About This Role">
              <p className="text-white/80 leading-relaxed">
                {job.about ||
                  `As a ${job.title}, you will contribute to building scalable products.`}
              </p>
            </Section>

            <Section title="Key Responsibilities">
              <ul className="list-disc list-inside space-y-2 text-white/80">
                {toList(job.responsibilities).length ? (
                  toList(job.responsibilities).map((x, i) => <li key={i}>{x}</li>)
                ) : (
                  <>
                    <li>Develop features</li>
                    <li>Write clean code</li>
                    <li>Collaborate with team</li>
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
                    <li>Strong fundamentals</li>
                    <li>Good JavaScript understanding</li>
                    <li>REST APIs basics</li>
                    <li>Basic Git</li>
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

            <p className="mt-6 text-sm text-white/60">
              Apply with your details and resume. Admin will review and accept/reject.
            </p>
          </div>
        </div>
      </div>

      {/* ✅ APPLY MODAL */}
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
              <button onClick={closeApply} className="text-white/70 hover:text-white">
                ✖
              </button>
            </div>

            <form onSubmit={handleApplySubmit}>
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-3">
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
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFile}
                      className="block w-full text-sm text-white/70
                                 file:mr-4 file:py-2 file:px-4
                                 file:rounded-lg file:border-0
                                 file:text-sm file:font-semibold
                                 file:bg-purple-600 file:text-white
                                 hover:file:bg-purple-700"
                    />
                  </div>
                  {resumeName && (
                    <p className="text-xs text-green-300 mt-1">Uploaded: {resumeName}</p>
                  )}
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
                    className="mt-2 w-full px-3 py-2 rounded-lg text-sm resize-none
                               bg-white/10 border border-white/20
                               focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <p className="text-xs text-white/50">
                  Note: This is stored in localStorage for now (frontend demo). Backend can be added later.
                </p>
              </div>

              <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeApply}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-sm border border-white/10"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 rounded-xl text-sm font-semibold transition
                    ${
                      submitting
                        ? "bg-purple-600/50 cursor-not-allowed"
                        : "bg-purple-600 hover:bg-purple-700"
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

/* ✅ Glass helper class (same as Dashboard style) */
const glass =
  "rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.35)]";

const Tag = ({ label }) => (
  <span className="px-4 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-white/80">
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
  <div className="flex justify-between text-sm mb-3 text-white/70">
    <span>{label}</span>
    <span className="font-medium text-white">{value}</span>
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
      className="mt-2 w-full px-3 py-2 rounded-lg text-sm
                 bg-white/10 border border-white/20
                 focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
  </div>
);

export default JobDetails;
