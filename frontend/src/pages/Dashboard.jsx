import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getApplications } from "../services/jobService";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [profileStrength, setProfileStrength] = useState(0);
  const [resumeStatus, setResumeStatus] = useState("Not Uploaded");
  const [atsScore, setAtsScore] = useState(null);
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [recentApps, setRecentApps] = useState([]);
  const [today, setToday] = useState(new Date());

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await api.get("/profile/me");
        setUser(res.data.user);
      } catch {
        navigate("/login");
      }
    };
    loadMe();
  }, [navigate]);

  useEffect(() => {
    const t = setInterval(() => setToday(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const savedResumeName = localStorage.getItem("resumeName");
    const latestATS = localStorage.getItem("latestATS");

    let strength = 0;

    if (savedResumeName) {
      setResumeStatus("Uploaded");
      strength += 40;
    } else {
      setResumeStatus("Not Uploaded");
    }

    if (latestATS) {
      try {
        const parsed = JSON.parse(latestATS);
        if (typeof parsed.score === "number") {
          setAtsScore(parsed.score);
          const boost = Math.round((parsed.score / 100) * 60);
          strength = Math.min(100, Math.max(strength, 40 + boost));
        }
      } catch {}
    }

    setProfileStrength(strength);
  }, []);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const apps = await getApplications();
        const accepted = (apps || []).filter((a) => a.status === "Accepted");
        setShortlistedCount(accepted.length);

        const sorted = (apps || [])
          .slice()
          .sort((a, b) => (b.id || 0) - (a.id || 0))
          .slice(0, 5);

        setRecentApps(sorted);
      } catch {
        setShortlistedCount(0);
        setRecentApps([]);
      }
    };
    loadApps();
  }, []);

  const greeting = useMemo(() => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, [today]);

  const formattedDate = useMemo(() => {
    return today.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, [today]);

  const strengthMeta = getStrengthMeta(profileStrength);

  const stats = useMemo(
    () => ({
      applied: recentApps.length,
      saved: 5,
      accepted: shortlistedCount,
      ats: atsScore !== null ? `${atsScore}/100` : "—",
      pending: recentApps.filter((a) => (a.status || "Pending") === "Pending").length,
    }),
    [recentApps, shortlistedCount, atsScore]
  );

  const steps = useMemo(() => {
    const hasResume = resumeStatus === "Uploaded";
    const hasATS = atsScore !== null;

    return [
      {
        key: "resume",
        title: "Upload resume",
        desc: "Add your latest resume to unlock ATS analysis.",
        done: hasResume,
        actionText: "Upload",
        onClick: () => navigate("/resume"),
      },
      {
        key: "ats",
        title: "Generate ATS report",
        desc: "Check missing keywords and formatting issues.",
        done: hasATS,
        actionText: "Check",
        onClick: () => navigate("/resume"),
      },
      {
        key: "improve",
        title: "Improve profile strength",
        desc: "Boost your score with better projects and keywords.",
        done: profileStrength >= 70,
        actionText: "Improve",
        onClick: () => navigate("/resume"),
      },
      {
        key: "track",
        title: "Track shortlisted status",
        desc: "See accepted applications and progress updates.",
        done: shortlistedCount > 0,
        actionText: "View",
        onClick: () => navigate("/shortlisted"),
      },
    ];
  }, [resumeStatus, atsScore, profileStrength, shortlistedCount, navigate]);

  const profileBreakdown = useMemo(() => {
    return [
      {
        label: "Resume Uploaded",
        value: resumeStatus === "Uploaded" ? 100 : 20,
      },
      {
        label: "ATS Readiness",
        value: atsScore !== null ? atsScore : 10,
      },
      {
        label: "Application Progress",
        value: shortlistedCount > 0 ? 80 : recentApps.length > 0 ? 45 : 15,
      },
    ];
  }, [resumeStatus, atsScore, shortlistedCount, recentApps.length]);

  const quickActions = [
    {
      title: "Resume & ATS",
      desc: "Upload, review, and improve your resume.",
      onClick: () => navigate("/resume"),
    },
    {
      title: "Explore Jobs",
      desc: "Discover roles that match your profile.",
      onClick: () => navigate("/jobs"),
    },
    {
      title: "Shortlisted",
      desc: "Track accepted applications and progress.",
      onClick: () => navigate("/shortlisted"),
    },
    {
      title: "Update Profile",
      desc: "Keep your profile polished and relevant.",
      onClick: () => navigate("/profile"),
    },
  ];

  const achievements = useMemo(() => {
    return [
      {
        title: "Resume Ready",
        active: resumeStatus === "Uploaded",
      },
      {
        title: "ATS Generated",
        active: atsScore !== null,
      },
      {
        title: "Strong Profile",
        active: profileStrength >= 70,
      },
      {
        title: "Got Accepted",
        active: shortlistedCount > 0,
      },
    ];
  }, [resumeStatus, atsScore, profileStrength, shortlistedCount]);

  const weeklyFocus = useMemo(() => {
    if (resumeStatus !== "Uploaded") {
      return "Upload your resume first to unlock better job matching and ATS analysis.";
    }
    if (atsScore === null) {
      return "Generate your ATS report this week to identify missing keywords and formatting issues.";
    }
    if (atsScore < 60) {
      return "Focus on improving ATS score by adding stronger keywords and measurable project outcomes.";
    }
    if (shortlistedCount === 0) {
      return "Your profile is improving. Apply to more jobs this week to increase response chances.";
    }
    return "You’re doing well. Keep applying consistently and monitor shortlisted updates.";
  }, [resumeStatus, atsScore, shortlistedCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white px-4 sm:px-6 pt-20 sm:pt-24 pb-10 sm:pb-14 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HERO */}
        <section className={`${glass} relative overflow-hidden px-5 sm:px-7 lg:px-10 py-6 sm:py-8 lg:py-10`}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 right-0 w-64 h-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="absolute -bottom-20 left-0 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />
          </div>

          <div className="relative grid grid-cols-1 xl:grid-cols-[1.25fr_0.85fr] gap-8 items-center">
            <div>
              <p className="text-white/55 text-xs sm:text-sm tracking-[0.2em] uppercase mb-3">
                TalentBridge Dashboard
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                {greeting}
                {user?.name ? `, ${user.name}` : ""} 👋
              </h1>

              <p className="mt-3 text-white/55 text-sm">{formattedDate}</p>

              <p className="mt-4 text-white/70 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
                Keep your profile strong, improve ATS performance, and track applications from one refined workspace.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Pill text={`Resume: ${resumeStatus}`} />
                <Pill text={atsScore !== null ? `ATS: ${atsScore}/100` : "ATS: Not generated"} />
                <Pill text={`Accepted: ${shortlistedCount}`} />
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <PrimaryButton onClick={() => navigate("/jobs")}>Explore Jobs</PrimaryButton>
                <SecondaryButton onClick={() => navigate("/resume")}>Resume & ATS</SecondaryButton>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white/55 text-sm">Profile Strength</p>
                  <p className="mt-2 text-5xl sm:text-6xl font-extrabold text-emerald-300">
                    {profileStrength}%
                  </p>
                  <p className="mt-2 text-sm text-white/65">{strengthMeta.label}</p>
                </div>

                <div className="text-right">
                  <p className="text-white/50 text-xs">ATS Score</p>
                  <p className="text-xl font-bold text-white/90 mt-1">
                    {atsScore !== null ? `${atsScore}/100` : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-5 h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 transition-all"
                  style={{ width: `${profileStrength}%` }}
                />
              </div>

              <p className="mt-3 text-sm text-white/60 leading-relaxed">
                {strengthMeta.tip}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <MiniBox label="Applied" value={stats.applied} />
                <MiniBox label="Saved" value={stats.saved} />
                <MiniBox label="Accepted" value={stats.accepted} />
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatPanel title="Profile Strength" value={`${profileStrength}%`} sub={strengthMeta.label} />
          <StatPanel title="ATS Score" value={stats.ats} sub="Resume quality" />
          <StatPanel title="Applications" value={stats.applied} sub="Recent total" />
          <StatPanel title="Accepted" value={stats.accepted} sub="Admin approved" />
          <StatPanel title="Pending" value={stats.pending} sub="Awaiting updates" />
        </section>

        {/* MAIN */}
        <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          {/* LEFT SIDE */}
          <div className="space-y-6">
            {/* Profile Overview */}
            <div className={`${glass} p-5 sm:p-6 lg:p-7`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold">Profile Overview</h2>
                  <p className="mt-2 text-white/70 text-sm sm:text-base">
                    A focused snapshot of your readiness and application momentum.
                  </p>

                  <div className="mt-6 space-y-4">
                    {profileBreakdown.map((item) => (
                      <ProgressRow key={item.label} label={item.label} value={item.value} />
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Chip text="Resume uploaded" done={resumeStatus === "Uploaded"} />
                    <Chip text="ATS available" done={atsScore !== null} />
                    <Chip text="Strong keywords" done={profileStrength >= 60} />
                    <Chip text="High readiness" done={profileStrength >= 80} />
                  </div>
                </div>

                <div className="w-full md:w-[250px] rounded-3xl bg-white/8 border border-white/10 p-5">
                  <p className="text-sm text-white/55">Current Status</p>
                  <div className="mt-4 space-y-3">
                    <MiniStat label="Resume" value={resumeStatus} />
                    <MiniStat label="ATS" value={atsScore !== null ? `${atsScore}/100` : "—"} />
                    <MiniStat label="Accepted" value={shortlistedCount} />
                    <MiniStat label="Saved Jobs" value={stats.saved} />
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Focus */}
            <div className={`${glass} p-5 sm:p-6 lg:p-7`}>
              <h2 className="text-xl sm:text-2xl font-bold">Weekly Focus</h2>
              <p className="mt-2 text-white/70 text-sm sm:text-base">
                One clear recommendation to keep your progress moving.
              </p>

              <div className="mt-5 rounded-2xl bg-white/8 border border-white/10 p-5">
                <p className="text-sm text-white/55">Focus Suggestion</p>
                <p className="mt-2 text-lg font-semibold leading-relaxed">{weeklyFocus}</p>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <PrimaryButton onClick={() => navigate("/resume")}>
                    Improve Resume
                  </PrimaryButton>
                  <SecondaryButton onClick={() => navigate("/jobs")}>
                    Explore Jobs
                  </SecondaryButton>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className={`${glass} p-5 sm:p-6 lg:p-7`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Recent Applications</h2>
                  <p className="text-white/70 mt-1 text-sm sm:text-base">
                    Your latest application activity.
                  </p>
                </div>

                <SecondaryButton onClick={() => navigate("/jobs")}>
                  View Jobs
                </SecondaryButton>
              </div>

              <div className="space-y-3">
                {recentApps.length === 0 ? (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-white/60 text-sm">
                    No applications yet. Start applying to jobs and they’ll appear here.
                  </div>
                ) : (
                  recentApps.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold break-words">{a.jobTitle || "—"}</p>
                        <p className="text-sm text-white/60 break-words">
                          {a.company || "—"} {a.location ? `• ${a.location}` : ""}
                        </p>
                        <p className="text-xs text-white/45 mt-1">{a.appliedAt || "—"}</p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <StatusPill status={a.status || "Pending"} />
                        <button
                          onClick={() => navigate("/jobs")}
                          className="px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 border border-white/10 hover:bg-white/20 transition"
                        >
                          Explore More
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
                <SecondaryButton onClick={() => navigate("/resume")}>
                  Improve ATS
                </SecondaryButton>
                <SecondaryButton onClick={() => navigate("/profile")}>
                  Update Profile
                </SecondaryButton>
                <PrimaryButton onClick={() => navigate("/jobs")}>
                  Apply to Jobs
                </PrimaryButton>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            {/* Next Steps */}
            <div className={`${glass} p-5 sm:p-6 lg:p-7`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold">Next Steps</h2>
                <span className="text-xs sm:text-sm text-white/55">
                  {steps.filter((s) => s.done).length}/{steps.length} done
                </span>
              </div>

              <p className="mt-2 text-white/70 text-sm sm:text-base">
                Clear and focused actions to improve your chances faster.
              </p>

              <div className="mt-5 space-y-3">
                {steps.map((s) => (
                  <StepRow
                    key={s.key}
                    title={s.title}
                    desc={s.desc}
                    done={s.done}
                    actionText={s.actionText}
                    onClick={s.onClick}
                  />
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`${glass} p-5 sm:p-6 lg:p-7`}>
              <h2 className="text-xl sm:text-2xl font-bold">Quick Actions</h2>
              <p className="mt-2 text-white/70 text-sm sm:text-base">
                Important shortcuts without clutter.
              </p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickActions.map((item) => (
                  <button
                    key={item.title}
                    onClick={item.onClick}
                    className="text-left rounded-2xl bg-white/6 border border-white/10 p-4 hover:bg-white/10 transition"
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-sm text-white/60 mt-1 leading-relaxed">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className={`${glass} p-5 sm:p-6 lg:p-7`}>
              <h2 className="text-xl sm:text-2xl font-bold">Achievements</h2>
              <p className="mt-2 text-white/70 text-sm sm:text-base">
                Small wins that show your progress.
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {achievements.map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-2xl border p-4 text-center ${
                      item.active
                        ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-100"
                        : "bg-white/5 border-white/10 text-white/60"
                    }`}
                  >
                    <div className="text-lg mb-2">{item.active ? "🏆" : "○"}</div>
                    <p className="text-sm font-semibold">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ATS Insight */}
            <div className={`${glass} p-5 sm:p-6 lg:p-7`}>
              <h2 className="text-xl sm:text-2xl font-bold">ATS Insight</h2>
              <p className="mt-2 text-white/70 text-sm sm:text-base">
                A quick recommendation based on your current progress.
              </p>

              <div className="mt-5 rounded-2xl bg-white/8 border border-white/10 p-5">
                <p className="text-sm text-white/55">Recommendation</p>
                <p className="mt-2 text-lg font-semibold leading-relaxed">
                  {atsScore === null
                    ? "Upload your resume and generate an ATS report first."
                    : atsScore < 60
                    ? "Your ATS score needs improvement. Focus on missing keywords and formatting."
                    : atsScore < 80
                    ? "Good score. Add stronger keywords and project details to improve further."
                    : "Excellent score. You’re in a strong position to apply confidently."}
                </p>

                <div className="mt-5">
                  <PrimaryButton onClick={() => navigate("/resume")}>
                    {atsScore !== null ? "View ATS Report" : "Check ATS Now"}
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const glass =
  "rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.35)]";

function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full sm:w-auto px-6 py-3 rounded-xl font-semibold bg-white/10 border border-white/10 hover:bg-white/20 transition"
    >
      {children}
    </button>
  );
}

function Pill({ text }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/10 text-white/80">
      {text}
    </span>
  );
}

function Chip({ text, done }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs border ${
        done
          ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-100"
          : "border-white/10 bg-white/5 text-white/70"
      }`}
    >
      {done ? "✅ " : "• "}
      {text}
    </span>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-white/55">{label}</span>
      <span className="text-white/90 font-semibold text-right break-words">{value}</span>
    </div>
  );
}

function MiniBox({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-3 text-center">
      <p className="text-xs text-white/50">{label}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
    </div>
  );
}

function StatPanel({ title, value, sub }) {
  return (
    <div className={`${glass} p-5`}>
      <p className="text-white/55 text-sm">{title}</p>
      <p className="text-2xl sm:text-3xl font-extrabold mt-2 break-words">{value}</p>
      <p className="text-white/50 text-sm mt-1">{sub}</p>
    </div>
  );
}

function ProgressRow({ label, value }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="text-sm text-white/70">{label}</p>
        <p className="text-sm text-white/85 font-semibold">{value}%</p>
      </div>
      <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-indigo-400 transition-all"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function StepRow({ title, desc, done, actionText, onClick }) {
  return (
    <div className="rounded-2xl bg-white/8 border border-white/10 p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 ${done ? "text-emerald-300" : "text-white/45"}`}>
          {done ? "✅" : "⭕"}
        </span>

        <div className="min-w-0">
          <p className="font-semibold break-words">{title}</p>
          <p className="text-sm text-white/55 mt-1 leading-relaxed break-words">{desc}</p>
        </div>
      </div>

      <div>
        <button
          onClick={onClick}
          disabled={done}
          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold transition ${
            done
              ? "bg-white/5 text-white/55 border border-white/10 cursor-default"
              : "bg-white/10 border border-white/10 hover:bg-white/20"
          }`}
        >
          {done ? "Done" : actionText}
        </button>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const cls =
    status === "Accepted"
      ? "bg-emerald-500/10 text-emerald-100 border-emerald-500/20"
      : status === "Rejected"
      ? "bg-red-500/10 text-red-100 border-red-500/20"
      : status === "Shortlisted"
      ? "bg-purple-500/10 text-purple-100 border-purple-500/20"
      : "bg-yellow-500/10 text-yellow-100 border-yellow-500/20";

  return (
    <span className={`px-3 py-1 rounded-full text-xs border whitespace-nowrap ${cls}`}>
      {status}
    </span>
  );
}

function getStrengthMeta(strength) {
  if (strength >= 80) {
    return { label: "Excellent", tip: "You’re ready to apply to top companies." };
  }
  if (strength >= 60) {
    return { label: "Good", tip: "Add more keywords and strong projects." };
  }
  if (strength >= 40) {
    return { label: "Average", tip: "Generate ATS report and fix resume mistakes." };
  }
  return { label: "Needs Work", tip: "Upload your resume to start improving." };
}