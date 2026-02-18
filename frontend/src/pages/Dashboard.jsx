import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getApplications } from "../services/jobService";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Real stats
  const [profileStrength, setProfileStrength] = useState(0);
  const [resumeStatus, setResumeStatus] = useState("Not Uploaded");
  const [atsScore, setAtsScore] = useState(null);
  const [shortlistedCount, setShortlistedCount] = useState(0);

  // Recent apps (optional demo list if none)
  const [recentApps, setRecentApps] = useState([]);

  // Demo job stats (replace later with API)
  const jobStats = useMemo(
    () => ({
      applied: 12,
      saved: 5,
    }),
    []
  );

  // Load user
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

  // Profile strength logic (NO RANDOM — 0 by default)
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
          // ATS can boost strength up to 60 points
          const boost = Math.round((parsed.score / 100) * 60);
          strength = Math.min(100, Math.max(strength, 40 + boost));
        }
      } catch {}
    }

    setProfileStrength(strength);
  }, []);

  // Load applications
  useEffect(() => {
    const loadApps = async () => {
      try {
        const apps = await getApplications();
        const accepted = (apps || []).filter((a) => a.status === "Accepted");
        setShortlistedCount(accepted.length);

        // Recent apps (last 5)
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

  // Next steps (interactive)
  const steps = useMemo(() => {
    const hasResume = resumeStatus === "Uploaded";
    const hasATS = atsScore !== null;

    return [
      {
        key: "resume",
        title: "Upload resume",
        done: hasResume,
        actionText: "Upload",
        onClick: () => navigate("/resume"),
      },
      {
        key: "ats",
        title: "Generate ATS report",
        done: hasATS,
        actionText: "Check",
        onClick: () => navigate("/resume"),
      },
      {
        key: "keywords",
        title: "Improve keywords",
        done: profileStrength >= 60,
        actionText: "Improve",
        onClick: () => navigate("/resume"),
      },
      {
        key: "shortlisted",
        title: "Track shortlisted status",
        done: shortlistedCount > 0,
        actionText: "View",
        onClick: () => navigate("/shortlisted"),
      },
    ];
  }, [resumeStatus, atsScore, profileStrength, shortlistedCount, navigate]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 text-white bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950">
      <div className="max-w-6xl mx-auto">
        {/* ===================== TOP HERO ===================== */}
        <div className="mb-10">
          <div className={`${glass} p-8`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-white/60 text-sm mb-2">TalentBridge Dashboard</p>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  Welcome{user?.name ? `, ${user.name}` : ""} 👋
                </h1>
                <p className="text-white/70 mt-3 text-lg max-w-2xl">
                  Your resume + ATS insights + shortlisted tracking — all in one place.
                </p>

                {/* Mini pills */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <Pill text={`Resume: ${resumeStatus}`} />
                  <Pill text={atsScore !== null ? `ATS: ${atsScore}/100` : "ATS: Not generated"} />
                  <Pill text={`Shortlisted: ${shortlistedCount}`} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <PrimaryButton onClick={() => navigate("/jobs")}>
                  Explore Jobs
                </PrimaryButton>
                <SecondaryButton onClick={() => navigate("/resume")}>
                  Resume & ATS
                </SecondaryButton>
                <SecondaryButton onClick={() => navigate("/shortlisted")}>
                  Shortlisted
                </SecondaryButton>
              </div>
            </div>
          </div>
        </div>

        {/* ===================== MAIN GRID ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT BIG: Strength + ATS */}
          <div className="lg:col-span-7 space-y-8">
            {/* Profile Strength big card */}
            <div className={`${glass} p-8`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold">Profile Strength</h2>
                  <p className="text-white/70 mt-2">
                    Calculated from your resume upload + ATS analysis (no random values).
                  </p>

                  <div className="mt-5">
                    <p className="text-white/60 text-sm mb-2">Progress</p>
                    <div className="w-full bg-white/15 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all"
                        style={{ width: `${profileStrength}%` }}
                      />
                    </div>
                    <p className="mt-2 text-white/70 text-sm">
                      {profileStrength}% • <span className="text-white/90 font-semibold">{strengthMeta.label}</span>
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

                {/* Score badge */}
                <div className="rounded-3xl bg-white/10 border border-white/10 px-6 py-5 min-w-[220px]">
                  <p className="text-white/60 text-sm">Overall</p>
                  <p className="text-4xl font-extrabold mt-1">
                    <span className="text-emerald-300">{profileStrength}</span>%
                  </p>
                  <p className="text-white/60 text-sm mt-1">{strengthMeta.label}</p>

                  <div className="mt-5 space-y-2">
                    <MiniStat label="Applied Jobs" value={jobStats.applied} />
                    <MiniStat label="Saved Jobs" value={jobStats.saved} />
                    <MiniStat label="Shortlisted" value={shortlistedCount} />
                  </div>
                </div>
              </div>
            </div>

            {/* ATS spotlight */}
            <div className={`${glass} p-8`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <h2 className="text-2xl font-bold">ATS Spotlight</h2>
                  <p className="text-white/70 mt-2">
                    Get detailed mistakes + missing keywords and improve instantly.
                  </p>
                </div>

                <PrimaryButton onClick={() => navigate("/resume")}>
                  {atsScore !== null ? "View ATS Report" : "Check ATS Now"}
                </PrimaryButton>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoTile title="ATS Score" value={atsScore !== null ? `${atsScore}/100` : "—"} />
                <InfoTile title="Resume" value={resumeStatus} />
                <InfoTile title="Shortlisted" value={`${shortlistedCount}`} />
              </div>
            </div>
          </div>

          {/* RIGHT: Next Steps + Shortlisted CTA */}
          <div className="lg:col-span-5 space-y-8">
            {/* Next steps (interactive) */}
            <div className={`${glass} p-8`}>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Next Steps</h2>
                <span className="text-white/60 text-sm">
                  {steps.filter((s) => s.done).length}/{steps.length} done
                </span>
              </div>

              <p className="text-white/70 mt-2">
                Follow this checklist to increase your ATS score faster.
              </p>

              <div className="mt-6 space-y-3">
                {steps.map((s) => (
                  <StepRow
                    key={s.key}
                    title={s.title}
                    done={s.done}
                    actionText={s.actionText}
                    onClick={s.onClick}
                  />
                ))}
              </div>
            </div>

            {/* Shortlisted CTA big */}
            <div className={`${glass} p-8`}>
              <h2 className="text-2xl font-bold">Shortlisted Candidates</h2>
              <p className="text-white/70 mt-2">
                When admin accepts your application, it will appear here.
              </p>

              <div className="mt-6 rounded-2xl bg-white/10 border border-white/10 p-5">
                <p className="text-white/60 text-sm">You have</p>
                <p className="text-4xl font-extrabold mt-1">
                  <span className="text-purple-300">{shortlistedCount}</span>
                  <span className="text-white/80 text-2xl"> shortlisted</span>
                </p>
                <p className="text-white/60 text-sm mt-2">
                  Status = Accepted by admin
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <PrimaryButton onClick={() => navigate("/shortlisted")}>
                  View Shortlisted
                </PrimaryButton>
                <SecondaryButton onClick={() => navigate("/jobs")}>
                  Apply More
                </SecondaryButton>
              </div>
            </div>
          </div>

          {/* BOTTOM: Recent Applications (clean table style) */}
          <div className="lg:col-span-12">
            <div className={`${glass} p-8`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Recent Applications</h2>
                  <p className="text-white/70 mt-1">
                    Latest applications from your activity (localStorage demo).
                  </p>
                </div>

                <SecondaryButton onClick={() => navigate("/jobs")}>
                  View Jobs
                </SecondaryButton>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
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
                            <p className="font-semibold">{a.jobTitle || "—"}</p>
                            <p className="text-white/60 text-sm">{a.location || ""}</p>
                          </td>
                          <td className="py-4 pr-4 text-white/80">
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

              <div className="mt-6 flex flex-wrap gap-3">
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

/* ================= UI Helpers ================= */

const glass =
  "rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.35)]";

function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 rounded-xl font-semibold bg-white/10 border border-white/10 hover:bg-white/20 transition"
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
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/60">{label}</span>
      <span className="text-white/90 font-semibold">{value}</span>
    </div>
  );
}

function InfoTile({ title, value }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-5">
      <p className="text-white/60 text-sm">{title}</p>
      <p className="text-2xl font-extrabold mt-1">{value}</p>
    </div>
  );
}

function StepRow({ title, done, actionText, onClick }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className={done ? "text-emerald-300" : "text-white/50"}>
          {done ? "✅" : "⭕"}
        </span>
        <p className="font-semibold">{title}</p>
      </div>

      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
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
      : "bg-yellow-500/10 text-yellow-100 border-yellow-500/20";

  return (
    <span className={`px-3 py-1 rounded-full text-xs border ${cls}`}>
      {status}
    </span>
  );
}

function getStrengthMeta(strength) {
  if (strength >= 80) {
    return { label: "Excellent", tip: "You’re ready to apply to top companies." };
  }
  if (strength >= 60) {
    return { label: "Good", tip: "Add more keywords + strong projects." };
  }
  if (strength >= 40) {
    return { label: "Average", tip: "Generate ATS report and fix mistakes." };
  }
  return { label: "Needs Work", tip: "Upload resume to start improving." };
}
