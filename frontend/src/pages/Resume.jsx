import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { scoreResume } from "../services/resumeService";

export default function Resume() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasSavedResume, setHasSavedResume] = useState(false);

  const [ats, setAts] = useState(null);
  const [loadingATS, setLoadingATS] = useState(false);
  const [jobDesc, setJobDesc] = useState("");

  const [activeSection, setActiveSection] = useState("overview");
  const [sevFilter, setSevFilter] = useState("all");
  const [issueQuery, setIssueQuery] = useState("");
  const [keywordQuery, setKeywordQuery] = useState("");
  const [kwTab, setKwTab] = useState("missing");
  const [expanded, setExpanded] = useState({});
  const [plan, setPlan] = useState([]);

  const refOverview = useRef(null);
  const refMistakes = useRef(null);
  const refKeywords = useRef(null);
  const refChecklist = useRef(null);
  const refPlan = useRef(null);

  useEffect(() => {
    const savedResume = localStorage.getItem("resumeName");
    if (savedResume) {
      setFile({ name: savedResume });
      setSaved(true);
      setHasSavedResume(true);
    } else {
      setFile(null);
      setSaved(false);
      setHasSavedResume(false);
    }
  }, []);

  const handleUpload = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setSaved(false);
      setHasSavedResume(false);
      setAts(null);
      setExpanded({});
      setPlan([]);
      setActiveSection("overview");
    }
  };

  const saveResume = () => {
    if (!file) return alert("Upload resume first!");
    localStorage.setItem("resumeName", file.name);
    setSaved(true);
    setHasSavedResume(true);
  };

  const checkATS = async () => {
    if (!file || !(file instanceof File)) {
      return alert("Please upload a real PDF/DOCX file before checking ATS.");
    }
    try {
      setLoadingATS(true);
      const data = await scoreResume(file, jobDesc);
      setLoadingATS(false);

      if (!data?.ok) return alert(data?.message || "ATS scoring failed");

      setAts(data);
      setActiveSection("overview");
      setExpanded({});
      setPlan([]);
    } catch {
      setLoadingATS(false);
      alert("Server error while scoring ATS");
    }
  };

  const strength = useMemo(() => {
    const goals = [];

    goals.push({
      key: "resume_uploaded",
      label: "Resume uploaded",
      weight: 15,
      pass: !!(file && file instanceof File),
    });

    goals.push({
      key: "resume_saved",
      label: "Resume saved",
      weight: 10,
      pass: !!hasSavedResume,
    });

    goals.push({
      key: "ats_generated",
      label: "ATS report generated",
      weight: 10,
      pass: !!ats,
    });

    const emails = ats?.detected?.emails || [];
    const phones = ats?.detected?.phones || [];
    const links = ats?.detected?.links || [];

    goals.push({
      key: "email_present",
      label: "Email present",
      weight: 8,
      pass: emails.length > 0,
    });

    goals.push({
      key: "phone_present",
      label: "Phone present",
      weight: 8,
      pass: phones.length > 0,
    });

    goals.push({
      key: "links_present",
      label: "LinkedIn/GitHub links present",
      weight: 6,
      pass: links.length > 0,
    });

    goals.push({
      key: "education_section",
      label: "Education section",
      weight: 6,
      pass: !!ats?.sectionStatus?.education,
    });

    goals.push({
      key: "skills_section",
      label: "Skills section",
      weight: 6,
      pass: !!ats?.sectionStatus?.skills,
    });

    goals.push({
      key: "experience_section",
      label: "Experience section",
      weight: 6,
      pass: !!ats?.sectionStatus?.experience,
    });

    goals.push({
      key: "projects_section",
      label: "Projects section",
      weight: 6,
      pass: !!ats?.sectionStatus?.projects,
    });

    const checklist = ats?.checklist || [];
    const checklistSubset = checklist.slice(0, 5);
    const checklistWeightTotal = 19;
    const per = checklistSubset.length > 0 ? checklistWeightTotal / checklistSubset.length : 0;

    checklistSubset.forEach((c, idx) => {
      goals.push({
        key: `ats_check_${idx}_${c.key}`,
        label: c.label,
        weight: per,
        pass: !!c.pass,
      });
    });

    const kw = ats?.keywordMatchPercent;
    goals.push({
      key: "keyword_match",
      label: "Keyword match ≥ 60%",
      weight: 4,
      pass: typeof kw === "number" ? kw >= 60 : false,
    });

    const total = goals.reduce((s, g) => s + g.weight, 0) || 100;
    const earned = goals.reduce((s, g) => s + (g.pass ? g.weight : 0), 0);
    const percent = Math.max(0, Math.min(100, Math.round((earned / total) * 100)));

    const done = goals.filter((g) => g.pass);
    const missing = goals.filter((g) => !g.pass);

    return { percent, goals, done, missing };
  }, [file, hasSavedResume, ats]);

  const filteredIssues = useMemo(() => {
    const issues = ats?.issues || [];
    const q = issueQuery.trim().toLowerCase();

    return issues
      .filter((i) => (sevFilter === "all" ? true : i.severity === sevFilter))
      .filter((i) => {
        if (!q) return true;
        return (
          (i.message || "").toLowerCase().includes(q) ||
          (i.fix || "").toLowerCase().includes(q) ||
          (i.type || "").toLowerCase().includes(q) ||
          (i.field || "").toLowerCase().includes(q)
        );
      });
  }, [ats, sevFilter, issueQuery]);

  const missingKeywords = useMemo(() => {
    const list = ats?.missingKeywords || [];
    const q = keywordQuery.trim().toLowerCase();
    return q ? list.filter((k) => k.toLowerCase().includes(q)) : list;
  }, [ats, keywordQuery]);

  const matchedKeywords = useMemo(() => {
    const list = ats?.matchedKeywords || [];
    const q = keywordQuery.trim().toLowerCase();
    return q ? list.filter((k) => k.toLowerCase().includes(q)) : list;
  }, [ats, keywordQuery]);

  const stats = useMemo(() => {
    const issues = ats?.issues || [];
    const high = issues.filter((i) => i.severity === "high").length;
    const medium = issues.filter((i) => i.severity === "medium").length;
    const low = issues.filter((i) => i.severity === "low").length;
    return { high, medium, low, total: issues.length };
  }, [ats]);

  const jumpTo = (key) => {
    const map = {
      overview: refOverview,
      mistakes: refMistakes,
      keywords: refKeywords,
      checklist: refChecklist,
      plan: refPlan,
    };
    const r = map[key];
    if (r?.current) r.current.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(key);
  };

  const toggleExpand = (idx) => setExpanded((p) => ({ ...p, [idx]: !p[idx] }));

  const copyText = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt);
      alert("Copied ✅");
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  const addToPlan = (item) => {
    const fix = item?.fix || item?.message || "";
    if (!fix) return;
    setPlan((p) => (p.includes(fix) ? p : [...p, fix]));
  };

  const removeFromPlan = (fix) => setPlan((p) => p.filter((x) => x !== fix));
  const clearPlan = () => setPlan([]);

  const score = ats?.score ?? 0;
  const level = ats?.level ?? "-";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 sm:mb-8 px-5 sm:px-6 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition w-full sm:w-auto"
        >
          Back to Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 sm:gap-8">
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/10 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-white/70 text-sm">TalentBridge</p>
                  <h2 className="text-xl font-extrabold">ATS Report</h2>
                </div>
                {ats && (
                  <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm">
                    {level}
                  </span>
                )}
              </div>

              <div className="mt-5 rounded-2xl bg-white/10 border border-white/10 p-4">
                <p className="text-white/70 text-sm">Profile Strength</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-3xl font-extrabold">
                    <span className="text-green-300">{strength.percent}</span>%
                  </p>
                  <ScoreGauge value={strength.percent} />
                </div>
                <div className="mt-3 w-full bg-white/20 rounded-full h-2">
                  <div
                    style={{ width: `${strength.percent}%` }}
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all"
                  />
                </div>
                <p className="text-white/60 text-xs mt-2">
                  Based on sections, contact info, formatting, and ATS checks.
                </p>
              </div>

              <div className="mt-5">
                <NavBtn active={activeSection === "overview"} onClick={() => jumpTo("overview")}>
                  Overview
                </NavBtn>

                <NavBtn active={activeSection === "mistakes"} onClick={() => jumpTo("mistakes")}>
                  Mistakes
                  {ats && <span className="ml-auto text-xs text-white/70">{stats.total}</span>}
                </NavBtn>

                <NavBtn active={activeSection === "keywords"} onClick={() => jumpTo("keywords")}>
                  Keywords
                </NavBtn>

                <NavBtn active={activeSection === "checklist"} onClick={() => jumpTo("checklist")}>
                  Checklist
                </NavBtn>

                <NavBtn active={activeSection === "plan"} onClick={() => jumpTo("plan")}>
                  My Plan
                  {plan.length > 0 && (
                    <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                      {plan.length}
                    </span>
                  )}
                </NavBtn>
              </div>

              {ats && (
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="High" value={stats.high} tone="red" />
                  <MiniStat label="Med" value={stats.medium} tone="yellow" />
                  <MiniStat label="Low" value={stats.low} tone="gray" />
                </div>
              )}

              {!ats && (
                <p className="mt-5 text-white/60 text-sm">
                  Upload a resume and click <b>Check ATS Score</b> to generate a report.
                </p>
              )}
            </div>
          </aside>

          <main className="space-y-8">
            <section className="rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/10 p-5 sm:p-6 lg:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2">Resume Manager</h1>
                  <p className="text-white/70 text-sm sm:text-base">
                    Upload, preview, and generate an interactive ATS report (mistakes + fixes).
                  </p>
                </div>

                {ats && (
                  <div className="flex items-center gap-4">
                    <ScoreGauge value={score} />
                    <div>
                      <p className="text-white/70 text-sm">ATS Score</p>
                      <p className="text-2xl sm:text-3xl font-extrabold">
                        <span className="text-green-300">{score}</span>/100
                      </p>
                      <p className="text-white/70 text-sm">Level: {level}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-white/25 rounded-2xl p-6 sm:p-10 text-center hover:bg-white/10 transition">
                    <p className="text-lg sm:text-xl mb-2">📄 Upload Resume</p>
                    <p className="text-white/60 mb-4 text-sm sm:text-base">PDF / DOCX supported</p>
                    <span className="inline-block bg-indigo-600 px-6 py-2 rounded-xl font-semibold">
                      Browse File
                    </span>
                    <input hidden type="file" onChange={handleUpload} />
                  </div>
                </label>

                {file && (
                  <div className="mt-5 bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
                        📎
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{file.name}</p>
                        <p className="text-white/60 text-sm">
                          {file instanceof File ? "Ready for ATS analysis" : "Saved name only (upload file for ATS)"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto">
                      <button
                        onClick={() => setOpen(true)}
                        disabled={!preview}
                        className="px-5 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition disabled:opacity-60 w-full sm:w-auto"
                      >
                        Preview
                      </button>

                      <button
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                          setSaved(false);
                          setHasSavedResume(false);
                          setAts(null);
                          setExpanded({});
                          setPlan([]);
                          localStorage.removeItem("resumeName");
                        }}
                        className="px-5 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition w-full sm:w-auto"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
                <button
                  onClick={saveResume}
                  className="px-7 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-400 to-emerald-500 hover:opacity-95 w-full sm:w-auto"
                >
                  {saved ? "Saved ✓" : "Save Resume"}
                </button>

                <button
                  onClick={() => setOpen(true)}
                  disabled={!preview}
                  className="px-7 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition disabled:opacity-60 w-full sm:w-auto"
                >
                  Live Preview
                </button>

                <button
                  onClick={checkATS}
                  disabled={!file || !(file instanceof File) || loadingATS}
                  className="px-7 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition disabled:opacity-60 w-full sm:w-auto"
                >
                  {loadingATS ? "Checking ATS..." : "Check ATS Score"}
                </button>
              </div>

              <div className="mt-8">
                <p className="text-sm text-white/70 mb-2">
                  Job Description (recommended for real ATS)
                </p>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl bg-white/10 border border-white/10 p-4 text-white placeholder:text-white/40 outline-none"
                  placeholder="Paste job description here..."
                />
              </div>
            </section>

            <section ref={refOverview} className="scroll-mt-28">
              <HeaderRow
                title="Overview"
                subtitle="Your strength breakdown (what is missing)."
              />
              <Panel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-3">✅ Completed</h3>
                    <div className="space-y-2">
                      {strength.done.slice(0, 10).map((g) => (
                        <div key={g.key} className="rounded-xl bg-white/10 border border-white/10 px-4 py-3">
                          <span className="text-green-300">✅</span>{" "}
                          <span className="text-white/90">{g.label}</span>
                        </div>
                      ))}
                      {strength.done.length === 0 && <p className="text-white/70">No items yet.</p>}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">❌ Missing (Improve)</h3>
                    <div className="space-y-2">
                      {strength.missing.slice(0, 10).map((g) => (
                        <div key={g.key} className="rounded-xl bg-white/10 border border-white/10 px-4 py-3">
                          <span className="text-red-300">❌</span>{" "}
                          <span className="text-white/90">{g.label}</span>
                        </div>
                      ))}
                      {strength.missing.length === 0 && <p className="text-white/70">All good ✅</p>}
                    </div>
                  </div>
                </div>
              </Panel>
            </section>

            <section ref={refMistakes} className="scroll-mt-28">
              <HeaderRow
                title="Mistakes"
                subtitle="Search + filter + expand + add to plan."
                right={
                  ats ? (
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full md:w-auto">
                      <select
                        value={sevFilter}
                        onChange={(e) => setSevFilter(e.target.value)}
                        className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none w-full sm:w-auto"
                      >
                        <option value="all" className="text-black">All</option>
                        <option value="high" className="text-black">High</option>
                        <option value="medium" className="text-black">Medium</option>
                        <option value="low" className="text-black">Low</option>
                      </select>

                      <input
                        value={issueQuery}
                        onChange={(e) => setIssueQuery(e.target.value)}
                        placeholder="Search mistakes..."
                        className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none w-full sm:w-auto"
                      />
                    </div>
                  ) : null
                }
              />

              <Panel>
                {!ats ? (
                  <p className="text-white/70">Generate ATS report to see mistakes.</p>
                ) : filteredIssues.length === 0 ? (
                  <p className="text-white/70">No issues found ✅</p>
                ) : (
                  <div className="space-y-3">
                    {filteredIssues.map((iss, idx) => (
                      <div key={idx} className="rounded-2xl bg-white/10 border border-white/10">
                        <button
                          onClick={() => toggleExpand(idx)}
                          className="w-full flex items-start justify-between gap-4 p-4 text-left"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <SeverityPill sev={iss.severity} />
                              <span className="font-semibold">{iss.message}</span>
                            </div>
                            <p className="text-white/60 text-sm mt-1">
                              Category: {iss.type} • Field: {iss.field}
                            </p>
                          </div>
                          <span className="text-white/60 shrink-0">{expanded[idx] ? "▲" : "▼"}</span>
                        </button>

                        {expanded[idx] && (
                          <div className="px-4 pb-4">
                            {iss.fix && (
                              <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                                <p className="text-white/70 text-sm mb-2">Recommended Fix</p>
                                <p className="text-white/90">{iss.fix}</p>

                                <div className="mt-3 flex flex-col sm:flex-row flex-wrap gap-2">
                                  <button
                                    onClick={() => copyText(iss.fix)}
                                    className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition text-sm w-full sm:w-auto"
                                  >
                                    Copy Fix
                                  </button>
                                  <button
                                    onClick={() => addToPlan(iss)}
                                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition text-sm w-full sm:w-auto"
                                  >
                                    Add to My Plan
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </section>

            <section ref={refKeywords} className="scroll-mt-28">
              <HeaderRow
                title="Keywords"
                subtitle="Search missing & matched keywords."
                right={
                  <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full md:w-auto">
                    <button
                      onClick={() => setKwTab("missing")}
                      className={`px-4 py-2 rounded-xl border text-sm transition ${
                        kwTab === "missing"
                          ? "bg-white/20 border-white/20"
                          : "bg-white/10 border-white/10 hover:bg-white/20"
                      }`}
                    >
                      Missing
                    </button>
                    <button
                      onClick={() => setKwTab("matched")}
                      className={`px-4 py-2 rounded-xl border text-sm transition ${
                        kwTab === "matched"
                          ? "bg-white/20 border-white/20"
                          : "bg-white/10 border-white/10 hover:bg-white/20"
                      }`}
                    >
                      Matched
                    </button>

                    <input
                      value={keywordQuery}
                      onChange={(e) => setKeywordQuery(e.target.value)}
                      placeholder="Search keywords..."
                      className="bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none w-full sm:w-auto"
                    />
                  </div>
                }
              />

              <Panel>
                {!ats ? (
                  <p className="text-white/70">Generate ATS report to see keywords.</p>
                ) : ats.keywordMatchPercent === null ? (
                  <p className="text-white/70">Paste a Job Description for keyword matching.</p>
                ) : (
                  <>
                    <p className="text-white/80 mb-4">
                      Keyword Match:{" "}
                      <span className="text-purple-300 font-bold">{ats.keywordMatchPercent}%</span>
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {(kwTab === "missing" ? missingKeywords : matchedKeywords).map((k, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 rounded-full border text-sm ${
                            kwTab === "missing"
                              ? "bg-white/10 border-white/10"
                              : "bg-green-500/10 border-green-400/20"
                          }`}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </Panel>
            </section>

            <section ref={refChecklist} className="scroll-mt-28">
              <HeaderRow title="Checklist" subtitle="ATS formatting checklist summary." />
              <Panel>
                {!ats ? (
                  <p className="text-white/70">Generate ATS report to see checklist.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(ats.checklist || []).map((c) => (
                      <div
                        key={c.key}
                        className="rounded-2xl bg-white/10 border border-white/10 p-4 flex items-start justify-between gap-4"
                      >
                        <div>
                          <p className="font-semibold">{c.label}</p>
                          <p className="text-white/60 text-sm mt-1">
                            {c.pass ? "Looks good ✅" : "Needs fixing ❌"}
                          </p>
                        </div>
                        <span className={c.pass ? "text-green-300" : "text-red-300"}>
                          {c.pass ? "✅" : "❌"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </section>

            <section ref={refPlan} className="scroll-mt-28">
              <HeaderRow
                title="My Plan"
                subtitle="Build your improvement plan and copy it."
                right={
                  plan.length > 0 ? (
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      <button
                        onClick={() => copyText(plan.map((p, i) => `${i + 1}. ${p}`).join("\n"))}
                        className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition text-sm w-full sm:w-auto"
                      >
                        Copy Plan
                      </button>
                      <button
                        onClick={() => clearPlan()}
                        className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition text-sm w-full sm:w-auto"
                      >
                        Clear
                      </button>
                    </div>
                  ) : null
                }
              />
              <Panel>
                {plan.length === 0 ? (
                  <p className="text-white/70">
                    Add items using <b>“Add to My Plan”</b> from the Mistakes section.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {plan.map((p, i) => (
                      <div
                        key={i}
                        className="rounded-2xl bg-white/10 border border-white/10 p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
                      >
                        <p className="font-semibold">
                          {i + 1}. {p}
                        </p>
                        <button
                          onClick={() => removeFromPlan(p)}
                          className="px-3 py-1 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition text-sm w-full sm:w-auto"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </section>
          </main>
        </div>

        {open && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white rounded-xl w-[95%] sm:w-[90%] lg:w-[80%] h-[85%] relative overflow-hidden">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded z-10"
              >
                Close
              </button>
              <iframe src={preview} className="w-full h-full rounded-xl" title="Resume Preview" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border text-left transition mt-2 ${
        active
          ? "bg-white/20 border-white/20"
          : "bg-white/10 border-white/10 hover:bg-white/20"
      }`}
    >
      {children}
    </button>
  );
}

function Panel({ children }) {
  return (
    <div className="rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/10 p-5 sm:p-6 shadow-[0_20px_80px_rgba(0,0,0,0.20)]">
      {children}
    </div>
  );
}

function HeaderRow({ title, subtitle, right }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold">{title}</h2>
        <p className="text-white/70 text-sm sm:text-base">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  const toneClass =
    tone === "red" ? "text-red-300" : tone === "yellow" ? "text-yellow-300" : "text-white/70";
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 px-2 py-3">
      <p className="text-white/70 text-xs">{label}</p>
      <p className={`text-lg font-extrabold ${toneClass}`}>{value}</p>
    </div>
  );
}

function SeverityPill({ sev }) {
  const cls =
    sev === "high"
      ? "bg-red-500/15 border-red-400/20 text-red-200"
      : sev === "medium"
      ? "bg-yellow-500/15 border-yellow-400/20 text-yellow-200"
      : "bg-white/10 border-white/10 text-white/80";
  return (
    <span className={`px-3 py-1 rounded-full border text-xs ${cls}`}>
      {String(sev || "low").toUpperCase()}
    </span>
  );
}

function ScoreGauge({ value }) {
  const size = 64;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value || 0));
  const dash = (pct / 100) * c;

  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="stroke-white/20"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          className="stroke-white"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
        {pct}
      </div>
    </div>
  );
}