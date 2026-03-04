import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * ✅ NEXT-NEXT LEVEL PROFILE (DEMO / localStorage)
 * Features:
 * - Multiple Education entries (add/remove)
 * - Multiple Experience entries (timeline)
 * - Projects section (add/remove) + quick bullets
 * - Certifications section (add/remove)
 * - Skills with suggestions + search
 * - Resume upload/view/remove (PDF)
 * - Photo upload/remove (image, size checks)
 * - ATS estimate score (keywords + completeness)
 * - Profile strength real percent
 * - Auto-save draft + toast
 * - Tabs + sticky left preview card
 * - Export JSON + Clear all
 */

export default function Profile() {
  const navigate = useNavigate();
  const STORAGE_KEY = "tb_profile_v2";

  // ---------- UI ----------
  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview | education | experience | projects | links
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ stable toast (fixes Vercel CI build)
  const toastTimerRef = useRef(null);
  const showToast = useCallback((msg) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 2200);
  }, []);

  // cleanup toast timer on unmount (safe)
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // ---------- PHOTO ----------
  const [photo, setPhoto] = useState(null); // dataURL
  const photoRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return showToast("Upload an image file");
    if (file.size > 2 * 1024 * 1024) return showToast("Image too big (max 2MB)");

    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result);
      setDirty(true);
      showToast("Photo updated ✅");
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    if (photoRef.current) photoRef.current.value = "";
    setDirty(true);
    showToast("Photo removed");
  };

  // ---------- BASIC FORM ----------
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    headline: "",
    summary: "",
    openToWork: true,
    preferredLocation: "Remote",
    jobType: ["Full Time"],
    github: "",
    linkedin: "",
    portfolio: "",
  });

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setDirty(true);
  };

  // ---------- SKILLS ----------
  const [skills, setSkills] = useState(["React", "Node.js"]);
  const [skillInput, setSkillInput] = useState("");
  const [skillSearch, setSkillSearch] = useState("");

  const addSkill = (skillRaw) => {
    const s = (skillRaw ?? skillInput).trim();
    if (!s) return;
    const exists = skills.some((x) => x.toLowerCase() === s.toLowerCase());
    if (exists) {
      setSkillInput("");
      return showToast("Skill already added");
    }
    setSkills((p) => [...p, s]);
    setSkillInput("");
    setDirty(true);
  };

  const removeSkill = (skill) => {
    setSkills((p) => p.filter((x) => x !== skill));
    setDirty(true);
  };

  const filteredSkills = useMemo(() => {
    const q = skillSearch.toLowerCase().trim();
    if (!q) return skills;
    return skills.filter((s) => s.toLowerCase().includes(q));
  }, [skills, skillSearch]);

  const skillSuggestions = [
    "Java",
    "DSA",
    "AWS",
    "Docker",
    "Kubernetes",
    "MySQL",
    "MongoDB",
    "Express",
    "TypeScript",
    "Tailwind",
    "GitHub Actions",
    "CI/CD",
    "REST APIs",
    "JWT",
    "RBAC",
    "System Design",
    "Linux",
  ];

  // ---------- RESUME ----------
  const [resumeName, setResumeName] = useState("");
  const [resumeDataUrl, setResumeDataUrl] = useState("");
  const [resumeErr, setResumeErr] = useState("");

  const handleResumeUpload = (e) => {
    setResumeErr("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") return setResumeErr("Only PDF resumes allowed.");
    if (file.size > 3 * 1024 * 1024) return setResumeErr("Resume too big (max 3MB).");

    const reader = new FileReader();
    reader.onload = () => {
      setResumeName(file.name);
      setResumeDataUrl(reader.result);
      setDirty(true);
      showToast("Resume uploaded ✅");
    };
    reader.readAsDataURL(file);
  };

  const openResume = () => {
    if (!resumeDataUrl) return showToast("No resume uploaded");
    const w = window.open();
    if (!w) return alert("Popup blocked. Allow popups to view resume.");
    w.document.title = resumeName || "resume.pdf";
    w.document.body.style.margin = "0";
    w.document.body.innerHTML = `<iframe src="${resumeDataUrl}" style="border:0;width:100%;height:100vh;"></iframe>`;
  };

  // ---------- MULTI EDUCATION ----------
  const [education, setEducation] = useState([
    { id: Date.now(), college: "", degree: "", passingYear: "", cgpa: "" },
  ]);

  const addEducation = () => {
    setEducation((p) => [
      ...p,
      { id: Date.now() + Math.random(), college: "", degree: "", passingYear: "", cgpa: "" },
    ]);
    setDirty(true);
    showToast("Education added ✅");
  };

  const removeEducation = (id) => {
    setEducation((p) => (p.length === 1 ? p : p.filter((e) => e.id !== id)));
    setDirty(true);
  };

  const updateEducation = (id, key, val) => {
    setEducation((p) => p.map((e) => (e.id === id ? { ...e, [key]: val } : e)));
    setDirty(true);
  };

  // ---------- MULTI EXPERIENCE (timeline) ----------
  const [experience, setExperience] = useState([
    {
      id: Date.now() + 11,
      role: "",
      company: "",
      start: "",
      end: "",
      location: "",
      highlights: "",
    },
  ]);

  const addExperience = () => {
    setExperience((p) => [
      ...p,
      {
        id: Date.now() + Math.random(),
        role: "",
        company: "",
        start: "",
        end: "",
        location: "",
        highlights: "",
      },
    ]);
    setDirty(true);
    showToast("Experience added ✅");
  };

  const removeExperience = (id) => {
    setExperience((p) => (p.length === 1 ? p : p.filter((x) => x.id !== id)));
    setDirty(true);
  };

  const updateExperience = (id, key, val) => {
    setExperience((p) => p.map((x) => (x.id === id ? { ...x, [key]: val } : x)));
    setDirty(true);
  };

  // ---------- PROJECTS ----------
  const [projects, setProjects] = useState([
    { id: Date.now() + 21, name: "TalentBridge", stack: "React, Node.js, MySQL", bullets: "" },
  ]);

  const addProject = () => {
    setProjects((p) => [...p, { id: Date.now() + Math.random(), name: "", stack: "", bullets: "" }]);
    setDirty(true);
    showToast("Project added ✅");
  };

  const removeProject = (id) => {
    setProjects((p) => (p.length === 1 ? p : p.filter((x) => x.id !== id)));
    setDirty(true);
  };

  const updateProject = (id, key, val) => {
    setProjects((p) => p.map((x) => (x.id === id ? { ...x, [key]: val } : x)));
    setDirty(true);
  };

  const addProjectBulletQuick = (id, text) => {
    const p = projects.find((x) => x.id === id);
    const base = (p?.bullets || "").trim();
    const next = base ? `${base}\n• ${text}` : `• ${text}`;
    updateProject(id, "bullets", next);
    showToast("Bullet added ✅");
  };

  // ---------- CERTIFICATIONS ----------
  const [certs, setCerts] = useState([{ id: Date.now() + 31, name: "", org: "", year: "" }]);

  const addCert = () => {
    setCerts((p) => [...p, { id: Date.now() + Math.random(), name: "", org: "", year: "" }]);
    setDirty(true);
    showToast("Certification added ✅");
  };

  const removeCert = (id) => {
    setCerts((p) => (p.length === 1 ? p : p.filter((x) => x.id !== id)));
    setDirty(true);
  };

  const updateCert = (id, key, val) => {
    setCerts((p) => p.map((x) => (x.id === id ? { ...x, [key]: val } : x)));
    setDirty(true);
  };

  // ---------- LOAD / AUTOSAVE ----------
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!saved) return;

    setForm(saved.form || form);
    setPhoto(saved.photo || null);
    setSkills(saved.skills || ["React", "Node.js"]);
    setResumeName(saved.resumeName || "");
    setResumeDataUrl(saved.resumeDataUrl || "");
    setEducation(saved.education || education);
    setExperience(saved.experience || experience);
    setProjects(saved.projects || projects);
    setCerts(saved.certs || certs);

    showToast("Profile loaded ✅");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  useEffect(() => {
    if (!dirty) return;
    const t = setTimeout(() => {
      const payload = { form, photo, skills, resumeName, resumeDataUrl, education, experience, projects, certs };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setDirty(false);
      showToast("Draft saved 💾");
    }, 1200);
    return () => clearTimeout(t);
  }, [dirty, form, photo, skills, resumeName, resumeDataUrl, education, experience, projects, certs, showToast]);

  // ---------- PROFILE STRENGTH ----------
  const strength = useMemo(() => {
    // 16 items
    const checks = [
      !!photo,
      !!form.fullName.trim(),
      !!form.email.trim(),
      !!form.location.trim(),
      !!form.phone.trim(),
      !!form.headline.trim(),
      (form.summary || "").trim().length >= 40,
      skills.length >= 5,
      !!resumeDataUrl,
      education.some((e) => e.college.trim() && e.degree.trim()),
      experience.some((x) => x.role.trim() && x.company.trim()),
      projects.some((p) => p.name.trim()),
      certs.some((c) => c.name.trim()),
      !!form.linkedin.trim(),
      !!form.github.trim() || !!form.portfolio.trim(),
      !!form.preferredLocation.trim(),
    ];
    const score = checks.filter(Boolean).length;
    const total = checks.length;
    const percent = Math.round((score / total) * 100);
    return { score, total, percent };
  }, [photo, form, skills.length, resumeDataUrl, education, experience, projects, certs]);

  // ---------- ATS ESTIMATE ----------
  const ats = useMemo(() => {
    const text =
      [
        form.headline,
        form.summary,
        skills.join(" "),
        experience.map((x) => `${x.role} ${x.company} ${x.highlights}`).join(" "),
        projects.map((p) => `${p.name} ${p.stack} ${p.bullets}`).join(" "),
        certs.map((c) => `${c.name} ${c.org}`).join(" "),
      ]
        .join(" ")
        .toLowerCase() || "";

    const keywords = [
      "react",
      "node",
      "express",
      "mysql",
      "mongodb",
      "aws",
      "docker",
      "kubernetes",
      "ci/cd",
      "github actions",
      "rest",
      "api",
      "jwt",
      "rbac",
      "system design",
      "typescript",
      "tailwind",
      "linux",
      "microservices",
      "testing",
      "postman",
    ];

    const hit = keywords.reduce((acc, k) => (text.includes(k) ? acc + 1 : acc), 0);
    const keywordScore = Math.min(55, Math.round((hit / keywords.length) * 55));

    const completeness = Math.round((strength.percent / 100) * 45);

    let score = keywordScore + completeness;
    score = Math.max(10, Math.min(98, score));

    const label =
      score >= 85 ? "Excellent" : score >= 70 ? "Strong" : score >= 55 ? "Good" : "Needs Improvement";

    return { score, label, hit };
  }, [form, skills, experience, projects, certs, strength.percent]);

  // ---------- TIPS ----------
  const tips = useMemo(() => {
    const t = [];
    if (!resumeDataUrl) t.push("Upload a PDF resume for recruiters.");
    if ((form.summary || "").trim().length < 40) t.push("Write a longer summary with impact + keywords.");
    if (skills.length < 5) t.push("Add at least 5 skills (React, Node, AWS, SQL, CI/CD...).");
    if (!form.linkedin.trim()) t.push("Add LinkedIn link to boost trust.");
    if (!experience.some((x) => x.highlights.trim().length >= 20))
      t.push("Add achievements in experience (metrics help).");
    return t.slice(0, 4);
  }, [resumeDataUrl, form.summary, skills.length, form.linkedin, experience]);

  // ---------- SAVE / EXPORT / CLEAR ----------
  const canSave = useMemo(() => {
    if (!form.fullName.trim()) return false;
    if (!form.email.trim() || !form.email.includes("@")) return false;
    return true;
  }, [form.fullName, form.email]);

  const saveProfile = async () => {
    if (!canSave) return showToast("Fill Full Name + valid Email");
    setSaving(true);
    await new Promise((r) => setTimeout(r, 550));
    const payload = { form, photo, skills, resumeName, resumeDataUrl, education, experience, projects, certs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setSaving(false);
    setDirty(false);
    showToast("Profile saved ✅");
  };

  const exportJson = () => {
    const payload = { form, photo, skills, resumeName, resumeDataUrl, education, experience, projects, certs };
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
    showToast("Copied profile JSON ✅");
  };

  const clearAll = () => {
    if (!window.confirm("Clear all profile data?")) return;
    localStorage.removeItem(STORAGE_KEY);
    setPhoto(null);
    setSkills(["React", "Node.js"]);
    setResumeName("");
    setResumeDataUrl("");
    setForm({
      fullName: "",
      email: "",
      phone: "",
      location: "",
      headline: "",
      summary: "",
      openToWork: true,
      preferredLocation: "Remote",
      jobType: ["Full Time"],
      github: "",
      linkedin: "",
      portfolio: "",
    });
    setEducation([{ id: Date.now(), college: "", degree: "", passingYear: "", cgpa: "" }]);
    setExperience([{ id: Date.now() + 11, role: "", company: "", start: "", end: "", location: "", highlights: "" }]);
    setProjects([{ id: Date.now() + 21, name: "TalentBridge", stack: "React, Node.js, MySQL", bullets: "" }]);
    setCerts([{ id: Date.now() + 31, name: "", org: "", year: "" }]);
    showToast("Cleared ✅");
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 px-6 py-16 text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute -top-10 -left-10 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-purple-500/10 rounded-full blur-3xl" />

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xl shadow-lg">
          <p className="text-sm text-white/90">{toast}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 transition font-semibold"
          >
            Back to Dashboard
          </button>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={clearAll}
              className="px-5 py-3 rounded-2xl bg-red-500/15 text-red-200 border border-red-400/20 hover:bg-red-500/25 transition"
            >
              Clear
            </button>
            <button
              onClick={exportJson}
              className="px-5 py-3 rounded-2xl bg-white/10 border border-white/20 hover:bg-white/15 transition"
            >
              Export JSON
            </button>
            <button
              onClick={saveProfile}
              disabled={!canSave || saving}
              className={`px-6 py-3 rounded-2xl font-semibold transition ${
                !canSave || saving
                  ? "bg-white/10 border border-white/10 text-white/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-400 to-emerald-500 hover:opacity-95"
              }`}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left sticky panel */}
          <aside className="lg:col-span-1">
            <div className="bg-white/10 border border-white/20 rounded-3xl p-7 shadow-2xl sticky top-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Profile"
                      className="w-24 h-24 rounded-2xl border border-white/20 object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-black/25 border border-white/15 flex items-center justify-center text-white/50">
                      Upload
                    </div>
                  )}

                  <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl cursor-pointer border border-white/20 hover:opacity-90 transition">
                    ✎
                    <input ref={photoRef} hidden type="file" accept="image/*" onChange={handlePhotoUpload} />
                  </label>
                </div>

                <div className="min-w-0">
                  <h1 className="text-2xl font-extrabold truncate">{form.fullName || "Your Name"}</h1>
                  <p className="text-sm text-white/70 truncate">{form.headline || "Add a headline to stand out"}</p>
                  <p className="text-xs text-white/50 truncate">{form.email || "your@email.com"}</p>

                  {photo && (
                    <button onClick={removePhoto} className="text-red-200 text-xs mt-1 underline">
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Strength + ATS */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <CardMini title="Strength" value={`${strength.percent}%`} tone="green" />
                <CardMini title="ATS" value={`${ats.score}/100`} tone="purple" />
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Profile Strength</span>
                  <span className="text-white/80 font-semibold">
                    {strength.score}/{strength.total}
                  </span>
                </div>
                <div className="w-full bg-white/15 rounded-full h-3 mt-2 overflow-hidden border border-white/10">
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all"
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
                <p className="text-xs mt-2 text-white/60">
                  ATS: <b className="text-white/85">{ats.label}</b> • Keyword hits:{" "}
                  <b className="text-white/85">{ats.hit}</b>
                </p>
              </div>

              {/* Quick actions */}
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge tone={form.openToWork ? "green" : "gray"}>{form.openToWork ? "Open to Work" : "Not Searching"}</Badge>
                <Badge tone="cyan">{form.preferredLocation}</Badge>
                {(form.jobType || []).map((t) => (
                  <Badge key={t} tone="purple">
                    {t}
                  </Badge>
                ))}
              </div>

              {/* Tips */}
              {tips.length > 0 && (
                <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4">
                  <p className="text-sm font-semibold">Next improvements</p>
                  <ul className="mt-2 space-y-1 text-xs text-white/70 list-disc pl-4">
                    {tips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resume */}
              <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-sm font-semibold">Resume (PDF)</p>
                <p className="text-xs text-white/60 mt-1">Max 3MB • Recruiter quick view</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition cursor-pointer text-sm">
                    Upload
                    <input hidden type="file" accept="application/pdf" onChange={handleResumeUpload} />
                  </label>
                  <button
                    type="button"
                    onClick={openResume}
                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition text-sm"
                  >
                    View
                  </button>
                  {resumeDataUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setResumeName("");
                        setResumeDataUrl("");
                        setDirty(true);
                        showToast("Resume removed");
                      }}
                      className="px-4 py-2 rounded-xl bg-red-500/15 text-red-200 border border-red-400/20 hover:bg-red-500/25 transition text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {resumeName && <p className="text-xs text-white/70 mt-2 truncate">📄 {resumeName}</p>}
                {resumeErr && <p className="text-xs text-red-200 mt-2">{resumeErr}</p>}
              </div>

              {/* Footer mini */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <MiniBadge title="Mode" value="Demo" />
                <MiniBadge title="Storage" value="Local" />
                <MiniBadge title="Draft" value={dirty ? "Changed" : "Saved"} />
              </div>
            </div>
          </aside>

          {/* Right editor */}
          <section className="lg:col-span-2">
            <div className="bg-white/10 border border-white/20 rounded-3xl p-7 shadow-2xl">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Tab active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
                  Overview
                </Tab>
                <Tab active={activeTab === "education"} onClick={() => setActiveTab("education")}>
                  Education
                </Tab>
                <Tab active={activeTab === "experience"} onClick={() => setActiveTab("experience")}>
                  Experience
                </Tab>
                <Tab active={activeTab === "projects"} onClick={() => setActiveTab("projects")}>
                  Projects
                </Tab>
                <Tab active={activeTab === "links"} onClick={() => setActiveTab("links")}>
                  Links
                </Tab>

                <div className="ml-auto flex items-center gap-2">
                  {dirty && (
                    <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-200 border border-yellow-400/20">
                      Unsaved changes
                    </span>
                  )}
                </div>
              </div>

              {/* OVERVIEW */}
              {activeTab === "overview" && (
                <>
                  <Section title="Basic Information" subtitle="Shown to recruiters and used for ATS matching.">
                    <Grid>
                      <Input label="Full Name *" value={form.fullName} onChange={(v) => setField("fullName", v)} />
                      <Input label="Email *" value={form.email} onChange={(v) => setField("email", v)} />
                      <Input label="Phone" value={form.phone} onChange={(v) => setField("phone", v)} />
                      <Input label="Location" value={form.location} onChange={(v) => setField("location", v)} />

                      <div className="md:col-span-2">
                        <Input
                          label="Headline (e.g., Full-Stack Developer | React | Node.js)"
                          value={form.headline}
                          onChange={(v) => setField("headline", v)}
                        />
                      </div>
                    </Grid>
                  </Section>

                  <Section title="Professional Summary" subtitle="Add impact + keywords. 2–4 lines is perfect.">
                    <textarea
                      className="input h-32"
                      value={form.summary}
                      onChange={(e) => setField("summary", e.target.value)}
                      placeholder="Example: Built secure hiring platform with RBAC, JWT auth, ATS scoring, scalable REST APIs, and MySQL..."
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                      <span>{(form.summary || "").length} chars</span>
                      <button
                        type="button"
                        onClick={() => {
                          const auto =
                            "Full-stack developer building secure, scalable web apps. Created TalentBridge with JWT auth, RBAC, ATS-style scoring, and REST APIs. Strong in React, Node.js, Express, MySQL, and clean modular architecture.";
                          setField("summary", auto);
                          showToast("Auto summary filled ✅");
                        }}
                        className="px-3 py-1 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15 transition"
                      >
                        Auto-fill
                      </button>
                    </div>
                  </Section>

                  <Section title="Skills" subtitle="Recruiters search by skills. Add more for better ATS.">
                    <div className="grid md:grid-cols-3 gap-3">
                      <input
                        className="input md:col-span-2"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                        placeholder="Add skill (press Enter)"
                      />
                      <button
                        type="button"
                        onClick={() => addSkill()}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-95 font-semibold"
                      >
                        Add Skill
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-xs text-white/60">Skills ({skills.length})</p>
                      <input
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                        className="px-4 py-2 rounded-xl bg-black/20 border border-white/15 focus:outline-none text-sm w-52"
                        placeholder="Search skills..."
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {filteredSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-4 py-2 bg-white/10 border border-white/15 rounded-full flex items-center gap-2 text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-red-300 hover:text-red-200 font-bold"
                            title="Remove"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4">
                      <p className="text-sm font-semibold">Quick Add</p>
                      <p className="text-xs text-white/60 mt-1">Click to add popular skills</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {skillSuggestions.map((s) => {
                          const exists = skills.some((x) => x.toLowerCase() === s.toLowerCase());
                          return (
                            <button
                              key={s}
                              type="button"
                              disabled={exists}
                              onClick={() => addSkill(s)}
                              className={`px-3 py-1 rounded-full text-xs border transition ${
                                exists
                                  ? "bg-white/5 border-white/10 text-white/35 cursor-not-allowed"
                                  : "bg-white/5 border-white/10 hover:bg-white/10"
                              }`}
                            >
                              + {s}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Section>

                  <Section title="Preferences" subtitle="Helps match you with better jobs.">
                    <Grid>
                      <Select
                        label="Preferred Location"
                        value={form.preferredLocation}
                        onChange={(v) => setField("preferredLocation", v)}
                        options={["Remote", "Hyderabad", "Bangalore", "Pune", "Delhi", "Chennai"]}
                      />

                      <div>
                        <label className="text-xs text-white/60">Open to Work</label>
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setField("openToWork", true)}
                            className={`px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                              form.openToWork
                                ? "bg-green-500/15 text-green-200 border-green-400/20"
                                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            ON
                          </button>
                          <button
                            type="button"
                            onClick={() => setField("openToWork", false)}
                            className={`px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                              !form.openToWork
                                ? "bg-red-500/15 text-red-200 border-red-400/20"
                                : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                            }`}
                          >
                            OFF
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs text-white/60">Job Type</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {["Full Time", "Internship", "Remote", "Part Time"].map((t) => {
                            const active = form.jobType.includes(t);
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => {
                                  const next = active ? form.jobType.filter((x) => x !== t) : [...form.jobType, t];
                                  setField("jobType", next.length ? next : ["Full Time"]);
                                }}
                                className={`px-4 py-2 rounded-xl border text-sm transition ${
                                  active
                                    ? "bg-purple-500/15 text-purple-200 border-purple-400/20"
                                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"
                                }`}
                              >
                                {t}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </Grid>
                  </Section>
                </>
              )}

              {/* EDUCATION */}
              {activeTab === "education" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-extrabold">Education</h2>
                      <p className="text-sm text-white/60">Add multiple entries (latest first).</p>
                    </div>
                    <button
                      type="button"
                      onClick={addEducation}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-95 font-semibold"
                    >
                      + Add Education
                    </button>
                  </div>

                  <div className="space-y-4">
                    {education.map((e, idx) => (
                      <div key={e.id} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold">Education #{idx + 1}</p>
                          <button
                            type="button"
                            onClick={() => removeEducation(e.id)}
                            className="px-3 py-1 rounded-lg bg-red-500/15 text-red-200 border border-red-400/20 hover:bg-red-500/25 transition text-xs"
                          >
                            Remove
                          </button>
                        </div>

                        <Grid>
                          <Input label="College" value={e.college} onChange={(v) => updateEducation(e.id, "college", v)} />
                          <Input label="Degree" value={e.degree} onChange={(v) => updateEducation(e.id, "degree", v)} />
                          <Input
                            label="Passing Year"
                            value={e.passingYear}
                            onChange={(v) => updateEducation(e.id, "passingYear", v)}
                          />
                          <Input label="CGPA" value={e.cgpa} onChange={(v) => updateEducation(e.id, "cgpa", v)} />
                        </Grid>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* EXPERIENCE */}
              {activeTab === "experience" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-extrabold">Experience Timeline</h2>
                      <p className="text-sm text-white/60">Add achievements with impact (metrics help!).</p>
                    </div>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-95 font-semibold"
                    >
                      + Add Experience
                    </button>
                  </div>

                  <div className="space-y-4">
                    {experience.map((x, idx) => (
                      <div key={x.id} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-sm font-semibold">Experience #{idx + 1}</p>
                            <p className="text-xs text-white/60">Tip: use bullets: start with •</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeExperience(x.id)}
                            className="px-3 py-1 rounded-lg bg-red-500/15 text-red-200 border border-red-400/20 hover:bg-red-500/25 transition text-xs"
                          >
                            Remove
                          </button>
                        </div>

                        <Grid>
                          <Input label="Role" value={x.role} onChange={(v) => updateExperience(x.id, "role", v)} />
                          <Input label="Company" value={x.company} onChange={(v) => updateExperience(x.id, "company", v)} />
                          <Input label="Start (e.g., Jan 2025)" value={x.start} onChange={(v) => updateExperience(x.id, "start", v)} />
                          <Input label="End (e.g., Present)" value={x.end} onChange={(v) => updateExperience(x.id, "end", v)} />
                          <div className="md:col-span-2">
                            <Input label="Location" value={x.location} onChange={(v) => updateExperience(x.id, "location", v)} />
                          </div>
                          <div className="md:col-span-2">
                            <textarea
                              className="input h-28"
                              value={x.highlights}
                              onChange={(e) => updateExperience(x.id, "highlights", e.target.value)}
                              placeholder="• Built REST APIs...\n• Implemented JWT + RBAC...\n• Improved performance by X%..."
                            />
                          </div>
                        </Grid>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {["JWT Auth", "RBAC", "REST APIs", "MySQL", "CI/CD", "Monitoring", "Testing"].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                const base = (x.highlights || "").trim();
                                const next = base ? `${base}\n• ${tag}` : `• ${tag}`;
                                updateExperience(x.id, "highlights", next);
                                showToast(`Added: ${tag}`);
                              }}
                              className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 hover:bg-white/10 transition"
                            >
                              + {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* PROJECTS */}
              {activeTab === "projects" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-extrabold">Projects</h2>
                      <p className="text-sm text-white/60">Show real work. Add 2–4 strong projects.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addProject}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-95 font-semibold"
                    >
                      + Add Project
                    </button>
                  </div>

                  <div className="space-y-4">
                    {projects.map((p, idx) => (
                      <div key={p.id} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-sm font-semibold">Project #{idx + 1}</p>
                            <p className="text-xs text-white/60">Use bullets with impact.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProject(p.id)}
                            className="px-3 py-1 rounded-lg bg-red-500/15 text-red-200 border border-red-400/20 hover:bg-red-500/25 transition text-xs"
                          >
                            Remove
                          </button>
                        </div>

                        <Grid>
                          <Input label="Project Name" value={p.name} onChange={(v) => updateProject(p.id, "name", v)} />
                          <Input label="Tech Stack" value={p.stack} onChange={(v) => updateProject(p.id, "stack", v)} />
                          <div className="md:col-span-2">
                            <textarea
                              className="input h-28"
                              value={p.bullets}
                              onChange={(e) => updateProject(p.id, "bullets", e.target.value)}
                              placeholder="• Built secure hiring platform...\n• Added ATS scoring...\n• Implemented role-based access..."
                            />
                          </div>
                        </Grid>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {[
                            "Implemented JWT authentication",
                            "Added RBAC for admin/recruiter/users",
                            "Built ATS-style resume scoring",
                            "Designed scalable REST APIs",
                            "Improved performance with indexing",
                          ].map((q) => (
                            <button
                              key={q}
                              type="button"
                              onClick={() => addProjectBulletQuick(p.id, q)}
                              className="px-3 py-2 rounded-xl text-xs bg-white/5 border border-white/10 hover:bg-white/10 transition"
                            >
                              + {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Certifications */}
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-extrabold">Certifications</h2>
                        <p className="text-sm text-white/60">Optional but boosts credibility.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addCert}
                        className="px-5 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15 transition font-semibold"
                      >
                        + Add
                      </button>
                    </div>

                    <div className="space-y-3">
                      {certs.map((c, idx) => (
                        <div key={c.id} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold">Certification #{idx + 1}</p>
                            <button
                              type="button"
                              onClick={() => removeCert(c.id)}
                              className="px-3 py-1 rounded-lg bg-red-500/15 text-red-200 border border-red-400/20 hover:bg-red-500/25 transition text-xs"
                            >
                              Remove
                            </button>
                          </div>

                          <Grid>
                            <Input label="Certification Name" value={c.name} onChange={(v) => updateCert(c.id, "name", v)} />
                            <Input label="Organization" value={c.org} onChange={(v) => updateCert(c.id, "org", v)} />
                            <Input label="Year" value={c.year} onChange={(v) => updateCert(c.id, "year", v)} />
                          </Grid>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* LINKS */}
              {activeTab === "links" && (
                <>
                  <Section title="Professional Links" subtitle="These links increase trust and conversion.">
                    <Grid>
                      <Input label="GitHub (https://...)" value={form.github} onChange={(v) => setField("github", v)} />
                      <Input label="LinkedIn (https://...)" value={form.linkedin} onChange={(v) => setField("linkedin", v)} />
                      <Input label="Portfolio (https://...)" value={form.portfolio} onChange={(v) => setField("portfolio", v)} />
                    </Grid>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <LinkBtn label="Open GitHub" url={form.github} />
                      <LinkBtn label="Open LinkedIn" url={form.linkedin} />
                      <LinkBtn label="Open Portfolio" url={form.portfolio} />
                    </div>
                  </Section>

                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-sm font-semibold">ATS Boost Tip</p>
                    <p className="text-xs text-white/70 mt-1">
                      Add GitHub + LinkedIn and include keywords like <b>REST APIs</b>, <b>JWT</b>, <b>RBAC</b>, <b>AWS</b>, <b>CI/CD</b>{" "}
                      in summary/experience.
                    </p>
                  </div>
                </>
              )}

              {/* Bottom buttons */}
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={!canSave || saving}
                  className={`px-10 py-3 rounded-2xl font-semibold transition ${
                    !canSave || saving
                      ? "bg-white/10 border border-white/10 text-white/50 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-400 to-emerald-500 hover:opacity-95 hover:scale-[1.01]"
                  }`}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="px-10 py-3 bg-white/10 border border-white/20 rounded-2xl hover:bg-white/15 transition"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-white/45 mt-4">Auto-save draft enabled • Stored in localStorage (demo). Connect DB later.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------------- UI Pieces ---------------- */

function Tab({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-2xl border transition text-sm font-semibold ${
        active ? "bg-white/15 border-white/25 text-white" : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="mb-8">
      <div className="mb-3">
        <h2 className="text-xl font-extrabold">{title}</h2>
        {subtitle && <p className="text-sm text-white/60 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid md:grid-cols-2 gap-4">{children}</div>;
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-white/60">{label}</label>
      <input className="input mt-2" value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={label} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs text-white/60">{label}</label>
      <select
        className="mt-2 w-full px-4 py-3 rounded-xl bg-black/20 border border-white/15 focus:outline-none"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function Badge({ children, tone }) {
  const cls =
    tone === "green"
      ? "bg-green-500/15 text-green-200 border-green-400/20"
      : tone === "cyan"
      ? "bg-cyan-500/15 text-cyan-200 border-cyan-400/20"
      : tone === "purple"
      ? "bg-purple-500/15 text-purple-200 border-purple-400/20"
      : "bg-white/5 text-white/70 border-white/10";
  return <span className={`px-3 py-1 rounded-full text-xs border ${cls}`}>{children}</span>;
}

function CardMini({ title, value, tone }) {
  const c =
    tone === "green" ? "bg-green-500/10 border-green-400/20 text-green-200" : "bg-purple-500/10 border-purple-400/20 text-purple-200";
  return (
    <div className={`rounded-2xl border p-4 ${c}`}>
      <p className="text-xs text-white/70">{title}</p>
      <p className="text-2xl font-extrabold mt-1">{value}</p>
    </div>
  );
}

function MiniBadge({ title, value }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center">
      <p className="text-[11px] text-white/55">{title}</p>
      <p className="text-sm font-bold text-white/85">{value}</p>
    </div>
  );
}

function LinkBtn({ label, url }) {
  const ok = (url || "").startsWith("http");
  return (
    <a
      href={ok ? url : "#"}
      target={ok ? "_blank" : undefined}
      rel={ok ? "noreferrer" : undefined}
      onClick={(e) => {
        if (!ok) e.preventDefault();
      }}
      className={`px-4 py-2 rounded-xl text-sm border transition ${
        ok ? "bg-white/10 border-white/20 hover:bg-white/15" : "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
      }`}
    >
      {label}
    </a>
  );
}

/* Tailwind utility class (keep in your global css if you already have it)
.input {
  @apply w-full px-4 py-3 rounded-xl bg-black/20 border border-white/15
  placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500;
}
*/