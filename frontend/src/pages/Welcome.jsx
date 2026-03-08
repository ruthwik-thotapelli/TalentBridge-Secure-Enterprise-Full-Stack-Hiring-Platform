import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import bgImage from "../assets/bg.png";

export default function Welcome() {
  const [faqOpen, setFaqOpen] = useState(0);

  useEffect(() => {
    const prevHtml = document.documentElement.style.overflowX;
    const prevBody = document.body.style.overflowX;
    const prevBg = document.body.style.background;

    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";
    document.body.style.background = "#020617";

    return () => {
      document.documentElement.style.overflowX = prevHtml;
      document.body.style.overflowX = prevBody;
      document.body.style.background = prevBg;
    };
  }, []);

  const stats = useMemo(
    () => [
      { value: "10K+", label: "Jobs Listed" },
      { value: "5K+", label: "Active Users" },
      { value: "500+", label: "Recruiters" },
      { value: "95%", label: "Success Rate" },
    ],
    []
  );

  const heroPills = useMemo(
    () => [
      { icon: "📄", text: "ATS Score" },
      { icon: "📈", text: "Profile Strength" },
      { icon: "⭐", text: "Save Jobs" },
      { icon: "🧾", text: "Track Applications" },
      { icon: "🔐", text: "Secure Login" },
    ],
    []
  );

  const brandLogos = useMemo(
    () => ["Google", "Amazon", "Microsoft", "Netflix", "Infosys", "TCS", "Wipro", "Deloitte"],
    []
  );

  const trustSignals = useMemo(
    () => [
      { icon: "✅", title: "Verified Jobs", desc: "Reduced spam & higher quality listings." },
      { icon: "🛡️", title: "Secure by Design", desc: "JWT + RBAC for user/recruiter/admin." },
      { icon: "⚡", title: "Fast & Responsive", desc: "Optimized UI for smooth experience." },
      { icon: "📌", title: "Smart Filters", desc: "Find exactly what matches your needs." },
    ],
    []
  );

  const featureCards = useMemo(
    () => [
      { icon: "🎯", title: "Smart Job Matching", desc: "Personalized jobs based on your skills and preferences." },
      { icon: "📄", title: "ATS Resume Score", desc: "Instant score + keyword suggestions to boost shortlisting." },
      { icon: "🔐", title: "Secure Login + RBAC", desc: "JWT auth with role-based access for user/recruiter/admin." },
      { icon: "⭐", title: "Save Jobs + Apply Later", desc: "Bookmark jobs and apply later without missing deadlines." },
      { icon: "🧾", title: "Application Tracking", desc: "Track applied jobs and status in one clean dashboard." },
      { icon: "📊", title: "Recruiter Dashboard", desc: "Post jobs, manage applicants, shortlist faster." },

      { icon: "⚡", title: "Fast Apply Flow", desc: "Quick profile-based applications with clean UI and speed." },
      { icon: "🧠", title: "Skill Suggestions", desc: "Recommended skills based on role and job market demand." },
      { icon: "📌", title: "Advanced Filters", desc: "Filter by type, location, experience, salary, and more." },
      { icon: "📝", title: "Projects Showcase", desc: "Add project bullets to stand out for recruiters." },
      { icon: "🎓", title: "Education Timeline", desc: "Add multiple education entries (clean and structured)." },

      { icon: "🧰", title: "Interview Prep", desc: "Save notes, track topics, and stay prepared for rounds." },
      { icon: "🔔", title: "Job Alerts", desc: "Get notified when jobs match your role and skills." },
      { icon: "🧪", title: "Keyword Booster", desc: "Instant keyword list to improve ATS ranking." },
      { icon: "🛡️", title: "Admin Controls", desc: "Secure admin panel to manage platform and users." },
      { icon: "📤", title: "Export Profile", desc: "Export profile JSON for backup / portability anytime." },

      { icon: "🌍", title: "Remote + Location Mode", desc: "Quickly switch between remote and city-based jobs." },
      { icon: "📅", title: "Deadline Saver", desc: "Never miss last-date with reminder-ready flow." },
      { icon: "🏷️", title: "Company Tags", desc: "See company type: startup / MNC / product / service." },
    ],
    []
  );

  const profileProChecklist = useMemo(
    () => [
      "Profile strength meter (real %)",
      "ATS keyword suggestions",
      "Resume upload + instant PDF preview",
      "Projects + education + experience sections",
      "Auto-save draft in localStorage",
      "Export profile as JSON",
      "Save jobs + apply later",
      "Application tracking dashboard",
    ],
    []
  );

  const categories = useMemo(
    () => [
      "Full Stack",
      "Frontend",
      "Backend",
      "DevOps",
      "Data Analyst",
      "QA",
      "UI/UX",
      "Cyber Security",
      "Internships",
      "Remote",
      "Hyderabad",
      "Bangalore",
    ],
    []
  );

  const steps = useMemo(
    () => [
      { n: "01", title: "Create your profile", desc: "Add skills, projects, education, experience and resume." },
      { n: "02", title: "Discover jobs", desc: "Search, filter, save jobs and apply quickly." },
      { n: "03", title: "Track & get hired", desc: "Track status and be ready for interviews with confidence." },
    ],
    []
  );

  const testimonials = useMemo(
    () => [
      { name: "Riya Sharma", role: "Student (CSE)", text: "ATS score helped me fix my resume and I got shortlisted faster." },
      { name: "Arjun Kumar", role: "Frontend Developer", text: "The UI is super clean and the job search is smooth daily." },
      { name: "Neha Verma", role: "Recruiter", text: "Posting jobs and managing applicants is easy with dashboard." },
    ],
    []
  );

  const faqs = useMemo(
    () => [
      { q: "Is TalentBridge free for job seekers?", a: "Yes. Job seekers can create a profile, upload resume, and apply to jobs for free." },
      { q: "How does ATS score work?", a: "ATS estimate is based on completeness + keywords in summary/skills/experience/projects." },
      { q: "Can recruiters post jobs?", a: "Yes. Recruiters can post jobs, view applicants and shortlist candidates." },
      { q: "Is my data secure?", a: "Yes. Secure auth and role-based access protect profile and application data." },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* ================= HERO ================= */}
      <section
        className="relative min-h-[92vh] bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-slate-950" />

        <div className="absolute -top-24 -left-24 w-64 h-64 sm:w-80 sm:h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-28 -right-28 w-72 h-72 sm:w-96 sm:h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-14 pb-12">
          <div className="inline-flex flex-wrap items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/10 border border-white/15 text-xs sm:text-sm backdrop-blur max-w-full">
            <span className="inline-block h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>Smart Hiring Platform • </span>
            <span className="text-white/70">Students + Professionals</span>
          </div>

          <div className="mt-8 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight break-words">
              Build a{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                brand-ready
              </span>{" "}
              career profile <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              and get hired faster
            </h1>

            <p className="mt-6 text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl">
              TalentBridge helps you create a strong profile, boost ATS score, and discover real opportunities.
              Recruiters hire faster with modern dashboards and workflows.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
              <Link
                to="/jobs"
                className="group relative w-full sm:w-auto text-center px-6 sm:px-10 py-4 rounded-2xl font-bold text-base sm:text-lg bg-indigo-600 hover:bg-indigo-700 transition shadow-[0_18px_60px_rgba(79,70,229,0.45)] hover:scale-[1.02]"
              >
                <span className="absolute inset-0 rounded-2xl blur-xl bg-indigo-500/25 opacity-0 group-hover:opacity-100 transition" />
                <span className="relative inline-flex items-center gap-2 justify-center">
                  Explore Jobs <Chevron />
                </span>
              </Link>

              <Link
                to="/profile"
                className="group relative w-full sm:w-auto text-center px-6 sm:px-10 py-4 rounded-2xl font-bold text-base sm:text-lg bg-white/10 border border-white/15 hover:bg-white/15 transition"
              >
                <span className="absolute inset-0 rounded-2xl blur-xl bg-white/10 opacity-0 group-hover:opacity-100 transition" />
                <span className="relative inline-flex items-center gap-2 justify-center">
                  Create Profile <Chevron />
                </span>
              </Link>

              <Link
                to="/login"
                className="group relative w-full sm:w-auto text-center px-6 sm:px-10 py-4 rounded-2xl font-bold text-base sm:text-lg border border-white/15 hover:bg-white/10 transition"
              >
                <span className="absolute inset-0 rounded-2xl blur-xl bg-purple-500/10 opacity-0 group-hover:opacity-100 transition" />
                <span className="relative inline-flex items-center gap-2 justify-center">
                  Get Started <Chevron />
                </span>
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {heroPills.map((p) => (
                <span
                  key={p.text}
                  className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs text-white/85 flex items-center gap-2"
                >
                  <span>{p.icon}</span>
                  <span>{p.text}</span>
                </span>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl">
              {stats.map((s) => (
                <Stat key={s.label} value={s.value} label={s.label} />
              ))}
            </div>

            <div className="mt-10 flex items-center gap-2 text-xs sm:text-sm text-white/60">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Scroll down to see features, profile builder, testimonials & more
            </div>
          </div>
        </div>
      </section>

      {/* ================= BRAND STRIP ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 overflow-hidden">
        <div className="rounded-3xl bg-white/[0.05] border border-white/10 p-4 sm:p-6">
          <p className="text-xs text-white/60">Trusted-style demo brand strip</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {brandLogos.map((x) => (
              <span
                key={x}
                className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-sm text-white/75 hover:bg-white/15 transition"
              >
                {x}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TRUST SIGNALS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trustSignals.map((t) => (
            <div key={t.title} className="rounded-3xl bg-white/[0.06] border border-white/10 p-6 hover:border-white/20 transition">
              <div className="text-2xl">{t.icon}</div>
              <p className="mt-3 font-bold">{t.title}</p>
              <p className="mt-1 text-sm text-white/70">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURES GRID ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 overflow-hidden">
        <SectionTitle
          title="Power features built for real hiring"
          subtitle="Everything you need — from ATS score to recruiter workflows."
        />

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((f) => (
            <div
              key={f.title}
              className="group rounded-3xl bg-white/[0.06] border border-white/10 p-5 sm:p-7
                         shadow-[0_20px_70px_rgba(0,0,0,0.35)]
                         hover:bg-white/[0.08] hover:border-white/20 transition relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition pointer-events-none" />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-3xl">{f.icon}</div>
                  <h3 className="mt-4 text-xl font-bold break-words">{f.title}</h3>
                  <p className="mt-2 text-white/75">{f.desc}</p>
                </div>

                <div className="shrink-0 hidden sm:block">
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/10 text-xs text-white/80 group-hover:bg-white/15 group-hover:border-white/20 transition">
                    Explore <Chevron small />
                  </span>
                </div>
              </div>

              <div className="mt-6 h-[1px] bg-white/10" />
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-xs text-white/55">Premium UI • Smooth UX</span>
                <span className="text-xs text-indigo-200/80">Details</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PROFILE BUILDER (MIDDLE) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 overflow-hidden">
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600/25 via-purple-600/20 to-white/5 border border-white/10 p-5 sm:p-8 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs text-white/70">Profile Builder</p>
              <h2 className="text-2xl sm:text-4xl font-extrabold mt-2">
                Build your profile like a pro
              </h2>
              <p className="text-white/80 mt-3 max-w-xl">
                Complete your profile and get ATS estimate instantly. Add skills, projects, education,
                experience and upload resume.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
                <Link
                  to="/profile"
                  className="group relative w-full sm:w-auto text-center px-6 sm:px-8 py-3 rounded-2xl font-semibold bg-white text-slate-950 hover:opacity-90 transition"
                >
                  <span className="absolute inset-0 rounded-2xl blur-xl bg-white/25 opacity-0 group-hover:opacity-100 transition" />
                  <span className="relative inline-flex items-center gap-2 justify-center">
                    Create Profile <Chevron dark />
                  </span>
                </Link>

                <Link
                  to="/jobs"
                  className="group relative w-full sm:w-auto text-center px-6 sm:px-8 py-3 rounded-2xl font-semibold bg-white/10 border border-white/10 hover:bg-white/15 transition"
                >
                  <span className="absolute inset-0 rounded-2xl blur-xl bg-indigo-500/15 opacity-0 group-hover:opacity-100 transition" />
                  <span className="relative inline-flex items-center gap-2 justify-center">
                    Browse Jobs <Chevron />
                  </span>
                </Link>

                <Link
                  to="/dashboard"
                  className="group relative w-full sm:w-auto text-center px-6 sm:px-8 py-3 rounded-2xl font-semibold bg-white/10 border border-white/10 hover:bg-white/15 transition"
                >
                  <span className="absolute inset-0 rounded-2xl blur-xl bg-purple-500/15 opacity-0 group-hover:opacity-100 transition" />
                  <span className="relative inline-flex items-center gap-2 justify-center">
                    Open Dashboard <Chevron />
                  </span>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-5 sm:p-6">
              <p className="text-sm font-semibold text-white/85">What you get</p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profileProChecklist.map((x) => (
                  <Check key={x} text={x} />
                ))}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <MiniMetric title="ATS" value="Estimate" />
                <MiniMetric title="Profile" value="Strength" />
                <MiniMetric title="Jobs" value="Tracking" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 overflow-hidden">
        <SectionTitle title="Popular categories" subtitle="Choose your path and start applying." />
        <div className="mt-8 rounded-3xl bg-white/[0.05] border border-white/10 p-5 sm:p-8 overflow-hidden">
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <span
                key={c}
                className="px-4 py-2 rounded-full bg-white/10 border border-white/10 text-sm text-white/80 hover:bg-white/15 transition"
              >
                {c}
              </span>
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <Link
              to="/jobs"
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold
                         bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition"
            >
              <span className="absolute inset-0 rounded-2xl blur-xl bg-indigo-500/25 opacity-0 group-hover:opacity-100 transition" />
              <span className="relative">Explore all jobs</span>
              <span className="relative"><Chevron /></span>
            </Link>

            <Link
              to="/profile"
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold
                         bg-white/10 border border-white/10 hover:bg-white/15 transition"
            >
              <span className="absolute inset-0 rounded-2xl blur-xl bg-white/10 opacity-0 group-hover:opacity-100 transition" />
              <span className="relative">Build your profile</span>
              <span className="relative"><Chevron /></span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 overflow-hidden">
        <SectionTitle title="How TalentBridge works" subtitle="Three steps to go from profile → interview." />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <StepCard key={s.n} n={s.n} title={s.title} desc={s.desc} />
          ))}
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 overflow-hidden">
        <SectionTitle title="Loved by job seekers & recruiters" subtitle="Real feedback from real users." />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-3xl bg-white/[0.06] border border-white/10 p-5 sm:p-7 hover:border-white/20 transition">
              <p className="text-white/80 leading-relaxed">“{t.text}”</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 grid place-items-center font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-white/60">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FAQ + CTA ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 overflow-hidden">
        <SectionTitle title="Frequently asked questions" subtitle="Quick answers about TalentBridge." />

        <div className="mt-10 grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-5 sm:p-6 overflow-hidden">
            {faqs.map((f, idx) => {
              const active = idx === faqOpen;
              return (
                <div key={f.q} className="border-b border-white/10 last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setFaqOpen(active ? -1 : idx)}
                    className="w-full py-4 flex items-center justify-between text-left gap-4"
                  >
                    <span className="font-semibold">{f.q}</span>
                    <span className="text-white/60 shrink-0">{active ? "−" : "+"}</span>
                  </button>
                  {active && <p className="pb-4 text-white/75">{f.a}</p>}
                </div>
              );
            })}
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-indigo-600/25 via-purple-600/20 to-white/5 border border-white/10 p-5 sm:p-8 overflow-hidden">
            <p className="text-sm text-white/70">Ready to start?</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-2">Make your profile recruiter-ready.</h3>
            <p className="text-white/80 mt-3 max-w-xl">
              Create your profile, upload resume, save jobs and apply confidently.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
              <Link
                to="/profile"
                className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-2xl font-semibold bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 transition"
              >
                <span className="absolute inset-0 rounded-2xl blur-xl bg-indigo-500/25 opacity-0 group-hover:opacity-100 transition" />
                <span className="relative">Create Profile</span>
                <span className="relative"><Chevron /></span>
              </Link>

              <Link
                to="/jobs"
                className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-2xl font-semibold bg-white/10 border border-white/10 hover:bg-white/15 transition"
              >
                <span className="absolute inset-0 rounded-2xl blur-xl bg-white/10 opacity-0 group-hover:opacity-100 transition" />
                <span className="relative">Explore Jobs</span>
                <span className="relative"><Chevron /></span>
              </Link>

              <Link
                to="/login"
                className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 rounded-2xl font-semibold bg-white/10 border border-white/10 hover:bg-white/15 transition"
              >
                <span className="absolute inset-0 rounded-2xl blur-xl bg-purple-500/15 opacity-0 group-hover:opacity-100 transition" />
                <span className="relative">Login</span>
                <span className="relative"><Chevron /></span>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3">
              <MiniMetric title="Secure" value="JWT" />
              <MiniMetric title="Roles" value="RBAC" />
              <MiniMetric title="Score" value="ATS" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= PREMIUM FOOTER ================= */}
      <footer className="border-t border-white/10 bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-[0_18px_60px_rgba(79,70,229,0.35)] grid place-items-center font-extrabold">
                  TB
                </div>
                <div>
                  <div className="text-xl font-extrabold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                    TalentBridge
                  </div>
                  <p className="text-sm text-white/60">Smart hiring platform for modern careers.</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <BrandPill icon="⚡" text="Fast Apply" />
                <BrandPill icon="📄" text="ATS Score" />
                <BrandPill icon="🔐" text="Secure RBAC" />
                <BrandPill icon="📊" text="Dashboards" />
              </div>

              <div className="mt-6 rounded-3xl bg-white/[0.06] border border-white/10 p-5">
                <p className="text-sm font-semibold">Get job updates</p>
               <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:justify-center">
  <input
    className="w-full min-w-0 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 outline-none placeholder:text-white/30"
    placeholder="Enter your email"
  />

  <button
    type="button"
    className="px-8 py-3 rounded-2xl  flex-items-center font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90 transition whitespace-nowrap"
  >
    Subscribe
  </button>
</div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <FooterTitle>Product</FooterTitle>
              <FooterLink to="/jobs" label="Browse Jobs" />
              <FooterLink to="/profile" label="Profile Builder" />
              <FooterLink to="/dashboard" label="Dashboard" />
              <FooterLink to="/login" label="Login" />
            </div>

            <div className="lg:col-span-2">
              <FooterTitle>Features</FooterTitle>
              <FooterText icon="✅" text="ATS Estimate + Tips" />
              <FooterText icon="✅" text="Saved Jobs" />
              <FooterText icon="✅" text="Application Tracking" />
              <FooterText icon="✅" text="Recruiter Tools" />
            </div>

            <div className="lg:col-span-2">
              <FooterTitle>Support</FooterTitle>
              <FooterText icon="💬" text="Help Center (demo)" />
              <FooterText icon="📩" text="support@talentbridge.com" />
              <FooterText icon="📍" text="Hyderabad, India" />
              <FooterText icon="🛡️" text="Privacy & Security" />
            </div>

            <div className="lg:col-span-2">
              <FooterTitle>Social</FooterTitle>
              <div className="mt-3 flex flex-wrap gap-2">
                <SocialBtn label="GitHub" />
                <SocialBtn label="LinkedIn" />
                <SocialBtn label="Twitter" />
                <SocialBtn label="YouTube" />
              </div>

              <div className="mt-6 rounded-3xl bg-white/[0.06] border border-white/10 p-5">
                <p className="text-sm font-semibold">Built for</p>
                <div className="mt-3 space-y-2 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    Students
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    Professionals
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    Recruiters
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-sm text-white/60">
            <div className="flex flex-wrap items-center gap-2">
              <span>© {new Date().getFullYear()} TalentBridge.</span>
              <span>All rights reserved.</span>
            </div>

            <div className="flex flex-wrap gap-4">
              <span className="hover:text-white transition cursor-pointer">Terms</span>
              <span className="hover:text-white transition cursor-pointer">Privacy</span>
              <span className="hover:text-white transition cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Small Components ---------- */

function Chevron({ small = false, dark = false }) {
  return (
    <svg
      width={small ? 14 : 18}
      height={small ? 14 : 18}
      viewBox="0 0 24 24"
      fill="none"
      className={`transition group-hover:translate-x-0.5 ${dark ? "text-slate-950" : "text-white/80"}`}
    >
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold">{title}</h2>
      {subtitle && <p className="mt-2 text-white/70 text-sm sm:text-base">{subtitle}</p>}
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 hover:bg-white/15 transition">
      <h3 className="text-xl sm:text-2xl font-extrabold">{value}</h3>
      <p className="text-xs sm:text-sm text-white/70">{label}</p>
    </div>
  );
}

function StepCard({ n, title, desc }) {
  return (
    <div className="rounded-3xl bg-white/[0.06] border border-white/10 p-5 sm:p-7 hover:border-white/20 transition">
      <div className="text-sm text-white/60 font-semibold">STEP {n}</div>
      <h3 className="mt-3 text-xl font-bold">{title}</h3>
      <p className="mt-2 text-white/75">{desc}</p>
    </div>
  );
}

function Check({ text }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 h-6 w-6 rounded-xl bg-white/10 border border-white/10 grid place-items-center text-green-300 shrink-0">
        ✓
      </span>
      <span className="text-sm text-white/80 leading-relaxed">{text}</span>
    </div>
  );
}

function MiniMetric({ title, value }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-center hover:bg-white/10 transition">
      <p className="text-[11px] text-white/55">{title}</p>
      <p className="text-sm font-bold text-white/85">{value}</p>
    </div>
  );
}

function BrandPill({ icon, text }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] border border-white/10 px-4 py-3 flex items-center gap-2 hover:bg-white/[0.1] transition">
      <span>{icon}</span>
      <span className="text-sm text-white/80 font-semibold">{text}</span>
    </div>
  );
}

function FooterTitle({ children }) {
  return <p className="text-sm font-bold text-white/85">{children}</p>;
}

function FooterLink({ to, label }) {
  return (
    <Link to={to} className="block mt-3 text-sm text-white/65 hover:text-white transition">
      {label}
    </Link>
  );
}

function FooterText({ icon, text }) {
  return (
    <div className="mt-3 text-sm text-white/65 flex items-center gap-2">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function SocialBtn({ label }) {
  return (
    <button
      type="button"
      className="px-4 py-2 rounded-2xl bg-white/10 border border-white/10 text-sm text-white/80
                 hover:bg-white/15 hover:border-white/20 transition shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
    >
      {label}
    </button>
  );
}