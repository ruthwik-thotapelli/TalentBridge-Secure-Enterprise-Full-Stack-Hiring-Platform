import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const highlights = useMemo(
    () => [
      { title: "Smart Matching", desc: "AI-inspired job suggestions based on your profile and interests." },
      { title: "Resume & ATS", desc: "Upload your resume, improve ATS score, and become more visible." },
      { title: "Application Tracking", desc: "Track pending, shortlisted, and accepted applications in one place." },
      { title: "Career Growth", desc: "Built for students, freshers, and professionals who want faster growth." },
    ],
    []
  );

  const categories = useMemo(
    () => [
      "Frontend Developer",
      "Backend Developer",
      "Full Stack Developer",
      "DevOps Engineer",
      "Cloud Engineer",
      "Data Analyst",
    ],
    []
  );

  const journey = useMemo(
    () => [
      {
        number: "01",
        title: "Create Your Profile",
        desc: "Build a strong professional profile with your skills, education, projects, and resume.",
      },
      {
        number: "02",
        title: "Discover Opportunities",
        desc: "Explore jobs that match your background and apply quickly with a streamlined workflow.",
      },
      {
        number: "03",
        title: "Track and Improve",
        desc: "Monitor application progress, improve ATS score, and keep your profile job-ready.",
      },
    ],
    []
  );

  const benefits = useMemo(
    () => [
      { label: "Verified Jobs", value: "Only quality opportunities" },
      { label: "Easy Applications", value: "Faster apply experience" },
      { label: "ATS Readiness", value: "Boost resume visibility" },
      { label: "Dashboard Tracking", value: "Everything in one place" },
    ],
    []
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white">
      {/* HERO */}
      <section className="relative px-4 sm:px-6 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs sm:text-sm text-white/75 mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Smart Hiring Platform • Students + Professionals
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Find the Right Job, <br />
              <span className="text-purple-300">Build Your Career</span>
            </h1>

            <p className="text-white/80 text-base sm:text-lg lg:text-xl mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              TalentBridge connects students and professionals with top companies.
              Apply smarter, improve your resume, track applications, and grow faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate("/jobs")}
                className="w-full sm:w-auto px-7 sm:px-8 py-3.5 rounded-2xl font-semibold bg-gradient-to-r from-green-400 to-emerald-500 hover:scale-[1.02] transition shadow-lg shadow-emerald-500/20"
              >
                Explore Jobs
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto px-7 sm:px-8 py-3.5 rounded-2xl font-semibold bg-white/10 border border-white/15 hover:bg-white/20 transition"
              >
                Go to Dashboard
              </button>

              <button
                onClick={() => navigate("/profile")}
                className="w-full sm:w-auto px-7 sm:px-8 py-3.5 rounded-2xl font-semibold bg-white/5 border border-white/10 hover:bg-white/15 transition"
              >
                Create Profile
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              <Badge text="ATS Score" />
              <Badge text="Profile Strength" />
              <Badge text="Save Jobs" />
              <Badge text="Track Applications" />
              <Badge text="Secure Login" />
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur-2xl p-5 sm:p-6 lg:p-7 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <StatCard value="10K+" label="Active Jobs" />
              <StatCard value="5K+" label="Companies" />
              <StatCard value="50K+" label="Candidates" />
              <StatCard value="95%" label="Success Rate" />
            </div>

            <div className="mt-6 rounded-3xl bg-white/5 border border-white/10 p-5">
              <p className="text-sm text-white/60">Why users love TalentBridge</p>
              <div className="mt-4 space-y-3">
                <MiniPoint text="Create a strong profile and become recruiter-ready." />
                <MiniPoint text="Upload resume and improve ATS visibility." />
                <MiniPoint text="Track every application from one dashboard." />
                <MiniPoint text="Discover roles that truly match your skills." />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST / VALUE STRIP */}
      <section className="px-4 sm:px-6 pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {benefits.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <p className="text-sm font-semibold text-white/90">{item.label}</p>
                <p className="text-sm text-white/60 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24 bg-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="How TalentBridge Works"
            subtitle="A simple and modern path from profile creation to job success."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-10">
            {journey.map((item) => (
              <Step
                key={item.number}
                number={item.number}
                title={item.title}
                desc={item.desc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Why Choose TalentBridge"
            subtitle="A smarter, faster, and more organized way to manage your job journey."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 mt-10">
            {highlights.map((item) => (
              <Feature key={item.title} title={item.title} desc={item.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* JOB CATEGORIES */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24 bg-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <SectionHeader
            title="Popular Career Paths"
            subtitle="Explore roles across today’s most in-demand technology and product domains."
          />

          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => navigate("/jobs")}
                className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/20 transition text-sm sm:text-base font-semibold"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS / PLATFORM SECTION */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          <div className="rounded-[28px] bg-white/[0.06] border border-white/10 backdrop-blur-2xl p-6 sm:p-8">
            <h3 className="text-2xl sm:text-3xl font-bold">Build a stronger professional presence</h3>
            <p className="text-white/75 text-sm sm:text-base mt-4 leading-relaxed">
              From resume uploads to ATS insights and application tracking, TalentBridge helps you
              present yourself better and move with more confidence in your job search.
            </p>

            <div className="mt-8 space-y-4">
              <ProgressItem label="Profile Completion" value="85%" />
              <ProgressItem label="Resume Readiness" value="92%" />
              <ProgressItem label="Application Tracking" value="100%" />
            </div>
          </div>

          <div className="rounded-[28px] bg-white/[0.06] border border-white/10 backdrop-blur-2xl p-6 sm:p-8">
            <h3 className="text-2xl sm:text-3xl font-bold">Designed for real career growth</h3>
            <p className="text-white/75 text-sm sm:text-base mt-4 leading-relaxed">
              Whether you are a student, fresher, or working professional, the platform gives you
              a cleaner workflow to manage opportunities and improve hiring visibility.
            </p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MiniFeature title="Track Progress" desc="See where every application stands." />
              <MiniFeature title="Improve Faster" desc="Use ATS insights to refine your resume." />
              <MiniFeature title="Stay Organized" desc="Manage jobs, profile, and progress in one place." />
              <MiniFeature title="Apply Smarter" desc="Spend less time searching and more time growing." />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto rounded-[32px] bg-gradient-to-r from-purple-600 to-indigo-600 p-8 sm:p-10 lg:p-14 text-center shadow-[0_20px_80px_rgba(76,29,149,0.35)]">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5 sm:mb-6">
            Ready to Take the Next Step?
          </h2>

          <p className="text-white/90 text-sm sm:text-base lg:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            Join thousands of candidates building stronger profiles, improving their ATS score,
            and finding better opportunities through TalentBridge.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/jobs")}
              className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold bg-white text-purple-700 hover:bg-gray-100 transition"
            >
              Get Started
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold bg-white/10 border border-white/20 hover:bg-white/20 transition"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const SectionHeader = ({ title, subtitle }) => (
  <div className="text-center max-w-3xl mx-auto">
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">{title}</h2>
    <p className="text-white/70 text-sm sm:text-base mt-3 leading-relaxed">{subtitle}</p>
  </div>
);

const Badge = ({ text }) => (
  <span className="px-4 py-2 rounded-full text-xs sm:text-sm bg-white/10 border border-white/10 text-white/80">
    {text}
  </span>
);

const StatCard = ({ value, label }) => (
  <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
    <h3 className="text-3xl sm:text-4xl font-bold text-purple-300">{value}</h3>
    <p className="text-sm sm:text-base text-white/75 mt-2">{label}</p>
  </div>
);

const MiniPoint = ({ text }) => (
  <div className="flex items-center gap-3">
    <span className="w-2 h-2 rounded-full bg-purple-300" />
    <p className="text-sm text-white/75">{text}</p>
  </div>
);

const Step = ({ number, title, desc }) => (
  <div className="bg-white/10 border border-white/20 rounded-[28px] p-6 sm:p-8 text-center hover:bg-white/[0.12] transition">
    <div className="text-purple-300 text-3xl sm:text-4xl font-bold mb-4">
      {number}
    </div>
    <h3 className="text-lg sm:text-xl font-semibold mb-3">{title}</h3>
    <p className="text-sm sm:text-base text-white/80 leading-relaxed">{desc}</p>
  </div>
);

const Feature = ({ title, desc }) => (
  <div className="bg-white/10 border border-white/20 rounded-[28px] p-6 sm:p-8 hover:bg-white/[0.12] transition">
    <h3 className="text-lg sm:text-xl font-semibold mb-3">{title}</h3>
    <p className="text-sm sm:text-base text-white/80 leading-relaxed">{desc}</p>
  </div>
);

const ProgressItem = ({ label, value }) => (
  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex items-center justify-between gap-3">
    <p className="text-sm sm:text-base text-white/80">{label}</p>
    <p className="text-lg font-bold text-purple-300">{value}</p>
  </div>
);

const MiniFeature = ({ title, desc }) => (
  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
    <h4 className="font-semibold">{title}</h4>
    <p className="text-sm text-white/70 mt-2 leading-relaxed">{desc}</p>
  </div>
);

export default Home;