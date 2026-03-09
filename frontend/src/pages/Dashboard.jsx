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

  const jobStats = useMemo(
    () => ({
      applied: recentApps.length,
      saved: 5,
    }),
    [recentApps]
  );

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

  const strengthMeta = getStrengthMeta(profileStrength);

  const steps = useMemo(() => {
    const hasResume = resumeStatus === "Uploaded";
    const hasATS = atsScore !== null;

    return [
      {
        key: "resume",
        title: "Upload resume",
        subtitle: "Add your latest resume to start ATS tracking",
        done: hasResume,
        actionText: "Upload",
        onClick: () => navigate("/resume"),
      },
      {
        key: "ats",
        title: "Generate ATS report",
        subtitle: "Check missing keywords and resume mistakes",
        done: hasATS,
        actionText: "Check",
        onClick: () => navigate("/resume"),
      },
      {
        key: "keywords",
        title: "Improve keywords",
        subtitle: "Match resume keywords with job descriptions",
        done: profileStrength >= 60,
        actionText: "Improve",
        onClick: () => navigate("/resume"),
      },
      {
        key: "shortlisted",
        title: "Track shortlisted status",
        subtitle: "Monitor accepted applications from admin",
        done: shortlistedCount > 0,
        actionText: "View",
        onClick: () => navigate("/shortlisted"),
      },
    ];
  }, [resumeStatus, atsScore, profileStrength, shortlistedCount, navigate]);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-10 sm:pb-16 px-4 sm:px-6 text-white bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* HERO */}
        <div className={`${glass} relative overflow-hidden p-5 sm:p-6 lg:p-8 mb-8`}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-16 w-56 h-56 bg-fuchsia-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div className="min-w-0">
              <p className="text-white/60 text-xs sm:text-sm mb-2 tracking-wide">
                TALENTBRIDGE • USER DASHBOARD
              </p>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight break-words">
                Welcome back{user?.name ? `, ${user.name}` : ""} 👋
              </h1>

              <p className="text-white/70 mt-3 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
                Track your profile strength, ATS score, recent applications, and shortlisted
                updates in one premium dashboard.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <Pill text={`Resume: ${resumeStatus}`} />
                <Pill text={atsScore !== null ? `ATS: ${atsScore}/100` : "ATS: Not generated"} />
                <Pill text={`Accepted: ${shortlistedCount}`} />
              </div>

              <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
                <PrimaryButton onClick={() => navigate("/jobs")}>Explore Jobs</PrimaryButton>
                <SecondaryButton onClick={() => navigate("/resume")}>Resume & ATS</SecondaryButton>
                <SecondaryButton onClick={() => navigate("/shortlisted")}>Shortlisted</SecondaryButton>
              </div>
            </div>

            <div className="w-full xl:max-w-sm">
              <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 sm:p-6">
                <p className="text-white/60 text-sm">Profile Progress</p>

                <div className="mt-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-4xl sm:text-5xl font-extrabold text-emerald-300">
                        {profileStrength}%
                      </p>
                      <p className="text-white/65 text-sm mt-1">{strengthMeta.label}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/50 text-xs">ATS Score</p>
                      <p className="text-lg font-semibold text-white/90">
                        {atsScore !== null ? `${atsScore}/100` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-3 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 transition-all"
                      style={{ width: `${profileStrength}%` }}
                    />
                  </div>

                  <p className="mt-3 text-sm text-white/60 leading-relaxed">
                    {strengthMeta.tip}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <SmallMetric label="Applied" value={jobStats.applied} />
                    <SmallMetric label="Saved" value={jobStats.saved} />
                    <SmallMetric label="Accepted" value={shortlistedCount} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-8">
          <QuickStatCard
            title="Profile Strength"
            value={`${profileStrength}%`}
            subtitle={strengthMeta.label}
            glow="emerald"
          />
          <QuickStatCard
            title="ATS Score"
            value={atsScore !== null ? `${atsScore}/100` : "—"}
            subtitle="Resume analysis"
            glow="purple"
          />
          <QuickStatCard
            title="Applications"
            value={jobStats.applied}
            subtitle="Recent total"
            glow="indigo"
          />
          <QuickStatCard
            title="Accepted"
            value={shortlistedCount}
            subtitle="Approved by admin"
            glow="pink"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
          {/* LEFT */}
          <div className="xl:col-span-7 space-y-6 sm:space-y-8">
            <div className={`${glass} p-5 sm:p-6 lg:p-8`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold">Profile Strength</h2>
                  <p className="text-white/70 mt-2 text-sm sm:text-base">
                    Calculated from your resume upload and ATS analysis.
                  </p>

                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <p className="text-white/60 text-sm">Progress</p>
                      <p className="text-white/85 text-sm font-semibold">{profileStrength}%</p>
                    </div>

                    <div className="w-full bg-white/15 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all"
                        style={{ width: `${profileStrength}%` }}
                      />
                    </div>

                    <p className="mt-3 text-white/70 text-xs sm:text-sm leading-relaxed">
                      <span className="text-white/90 font-semibold">{strengthMeta.label}</span>
                      <span className="text-white/50"> — {strengthMeta.tip}</span>
                    </p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <Chip text="Resume uploaded" done={resumeStatus === "Uploaded"} />
                    <Chip text="ATS report ready" done={atsScore !== null} />
                    <Chip text="Keywords improved" done={profileStrength >= 60} />
                    <Chip text="Mistakes fixed" done={profileStrength >= 80} />
                  </div>
                </div>

                <div className="rounded-3xl bg-white/10 border border-white/10 px-5 py-5 w-full md:w-auto md:min-w-[230px]">
                  <p className="text-white/60 text-sm">Current Level</p>
                  <p className="text-3xl sm:text-4xl font-extrabold mt-1">
                    <span className="text-emerald-300">{profileStrength}</span>%
                  </p>
                  <p className="text-white/60 text-sm mt-1">{strengthMeta.label}</p>

                  <div className="mt-5 space-y-2">
                    <MiniStat label="Resume Status" value={resumeStatus} />
                    <MiniStat label="ATS Score" value={atsScore !== null ? `${atsScore}/100` : "—"} />
                    <MiniStat label="Accepted" value={shortlistedCount} />
                  </div>
                </div>
              </div>
            </div>

            <div className={`${glass} p-5 sm:p-6 lg:p-8`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">ATS Spotlight</h2>
                  <p className="text-white/70 mt-2 text-sm sm:text-base leading-relaxed">
                    Analyze your resume, find missing keywords, detect formatting issues, and
                    improve your score instantly.
                  </p>
                </div>

                <PrimaryButton onClick={() => navigate("/resume")}>
                  {atsScore !== null ? "View ATS Report" : "Check ATS Now"}
                </PrimaryButton>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <InfoTile title="ATS Score" value={atsScore !== null ? `${atsScore}/100` : "—"} />
                <InfoTile title="Resume" value={resumeStatus} />
                <InfoTile title="Accepted" value={`${shortlistedCount}`} />
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="xl:col-span-5 space-y-6 sm:space-y-8">
            <div className={`${glass} p-5 sm:p-6 lg:p-8`}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl sm:text-2xl font-bold">Next Steps</h2>
                <span className="text-white/60 text-xs sm:text-sm">
                  {steps.filter((s) => s.done).length}/{steps.length} done
                </span>
              </div>

              <p className="text-white/70 mt-2 text-sm sm:text-base">
                Complete these actions to improve your hiring chances.
              </p>

              <div className="mt-6 space-y-3">
                {steps.map((s) => (
                  <StepRow
                    key={s.key}
                    title={s.title}
                    subtitle={s.subtitle}
                    done={s.done}
                    actionText={s.actionText}
                    onClick={s.onClick}
                  />
                ))}
              </div>
            </div>

            <div className={`${glass} p-5 sm:p-6 lg:p-8`}>
              <h2 className="text-xl sm:text-2xl font-bold">Accepted Applications</h2>
              <p className="text-white/70 mt-2 text-sm sm:text-base">
                When admin accepts your application, it appears here.
              </p>

              <div className="mt-6 rounded-2xl bg-white/10 border border-white/10 p-5">
                <p className="text-white/60 text-sm">Current status</p>
                <p className="text-3xl sm:text-4xl font-extrabold mt-2 break-words">
                  <span className="text-purple-300">{shortlistedCount}</span>
                  <span className="text-white/80 text-xl sm:text-2xl"> accepted</span>
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Applications approved by admin are shown in your shortlisted page.
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <PrimaryButton onClick={() => navigate("/shortlisted")}>
                  View Shortlisted
                </PrimaryButton>
                <SecondaryButton onClick={() => navigate("/jobs")}>
                  Apply More
                </SecondaryButton>
              </div>
            </div>
          </div>

          {/* RECENT APPLICATIONS */}
          <div className="xl:col-span-12">
            <div className={`${glass} p-5 sm:p-6 lg:p-8`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Recent Applications</h2>
                  <p className="text-white/70 mt-1 text-sm sm:text-base">
                    Your latest job application activity.
                  </p>
                </div>

                <SecondaryButton onClick={() => navigate("/jobs")}>
                  View Jobs
                </SecondaryButton>
              </div>

              {/* desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead className="text-left text-white/60 text-sm border-b border-white/10">
                    <tr>
                      <th className="py-3 pr-4">Job</th>
                      <th className="py-3 pr-4">Company</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Applied</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(recentApps || []).length === 0 ? (
                      <tr>
                        <td className="py-6 text-white/60" colSpan={4}>
                          No applications yet. Apply to jobs and you’ll see them here.
                        </td>
                      </tr>
                    ) : (
                      recentApps.map((a) => (
                        <tr
                          key={a.id}
                          className="border-b border-white/10 hover:bg-white/5 transition"
                        >
                          <td className="py-4 pr-4">
                            <p className="font-semibold break-words">{a.jobTitle || "—"}</p>
                            <p className="text-white/60 text-sm">{a.location || ""}</p>
                          </td>
                          <td className="py-4 pr-4 text-white/80 break-words">
                            {a.company || "—"}
                          </td>
                          <td className="py-4 pr-4">
                            <StatusPill status={a.status || "Pending"} />
                          </td>
                          <td className="py-4 pr-4 text-white/60 text-sm">
                            {a.appliedAt || "—"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* mobile cards */}
              <div className="md:hidden space-y-3">
                {(recentApps || []).length === 0 ? (
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-white/60 text-sm">
                    No applications yet. Apply to jobs and you’ll see them here.
                  </div>
                ) : (
                  recentApps.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-2xl bg-white/5 border border-white/10 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold break-words">{a.jobTitle || "—"}</p>
                          <p className="text-sm text-white/60 break-words">{a.company || "—"}</p>
                        </div>
                        <StatusPill status={a.status || "Pending"} />
                      </div>
                      <p className="text-xs text-white/50 mt-3">{a.appliedAt || "—"}</p>
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
        </div>
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
    <div className="flex items-center justify-between text-sm gap-3">
      <span className="text-white/60">{label}</span>
      <span className="text-white/90 font-semibold break-words text-right">{value}</span>
    </div>
  );
}

function SmallMetric({ label, value }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 px-3 py-3 text-center">
      <p className="text-white/50 text-xs">{label}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
    </div>
  );
}

function QuickStatCard({ title, value, subtitle, glow = "purple" }) {
  const glowMap = {
    emerald: "shadow-[0_0_35px_rgba(16,185,129,0.16)]",
    purple: "shadow-[0_0_35px_rgba(168,85,247,0.16)]",
    indigo: "shadow-[0_0_35px_rgba(99,102,241,0.16)]",
    pink: "shadow-[0_0_35px_rgba(236,72,153,0.16)]",
  };

  return (
    <div className={`${glass} p-5 ${glowMap[glow]}`}>
      <p className="text-white/60 text-sm">{title}</p>
      <p className="text-2xl sm:text-3xl font-extrabold mt-2 break-words">{value}</p>
      <p className="text-white/50 text-sm mt-1">{subtitle}</p>
    </div>
  );
}

function InfoTile({ title, value }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-5">
      <p className="text-white/60 text-sm">{title}</p>
      <p className="text-xl sm:text-2xl font-extrabold mt-1 break-words">{value}</p>
    </div>
  );
}

function StepRow({ title, subtitle, done, actionText, onClick }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <span className={`mt-0.5 ${done ? "text-emerald-300" : "text-white/50"}`}>
          {done ? "✅" : "⭕"}
        </span>

        <div className="min-w-0">
          <p className="font-semibold break-words">{title}</p>
          <p className="text-xs text-white/55 mt-1 break-words">{subtitle}</p>
        </div>
      </div>

      <button
        onClick={onClick}
        className={`w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-semibold transition ${
          done
            ? "bg-white/5 text-white/60 border border-white/10 cursor-default"
            : "bg-white/10 hover:bg-white/20 border border-white/10"
        }`}
        disabled={done}
      >
        {done ? "Done" : actionText}
      </button>
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