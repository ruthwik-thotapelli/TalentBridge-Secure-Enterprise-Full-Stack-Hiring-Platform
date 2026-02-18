import { Link } from "react-router-dom";
import bgImage from "../assets/bg.png";

function Welcome() {
  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Soft overlay (not heavy) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-transparent"></div>

      {/* Main container */}
      <div className="relative z-10 min-h-screen max-w-7xl mx-auto px-6 flex items-center">
        <div className="max-w-2xl text-white">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 rounded-full bg-white/20 text-sm backdrop-blur">
            🚀 Smart Hiring Platform
          </div>

          {/* Heading */}
          <h1 className="text-6xl font-extrabold leading-tight mb-6">
            Connecting Talent <br />
            to{" "}
            <span className="text-indigo-400">
              Opportunities
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg text-white/90 leading-relaxed mb-10">
            TalentBridge empowers students and professionals to discover
            meaningful career opportunities, while helping recruiters hire
            faster through a modern, intelligent hiring platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-5 mb-12">
            <Link
              to="/jobs"
              className="px-10 py-4 rounded-xl font-bold text-lg
                         bg-indigo-600 hover:bg-indigo-700 transition
                         shadow-xl hover:scale-[1.03]"
            >
              Explore Jobs
            </Link>

            <Link
              to="/login"
              className="px-10 py-4 rounded-xl font-bold text-lg
                         border border-white/40 hover:bg-white/20 transition"
            >
              Get Started
            </Link>
          </div>

          {/* Trust / Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
            <Stat value="10K+" label="Jobs Listed" />
            <Stat value="5K+" label="Active Users" />
            <Stat value="500+" label="Recruiters" />
            <Stat value="95%" label="Success Rate" />
          </div>

          {/* Feature Line */}
          <div className="flex flex-wrap gap-6 text-sm text-white/80">
            <Feature text="Job Search" />
            <Feature text="Resume Upload" />
            <Feature text="Recruiter Tools" />
            <Feature text="Secure Login" />
          </div>

        </div>
      </div>
    </div>
  );
}

/* ========== Small Components ========== */

const Feature = ({ text }) => (
  <div className="flex items-center gap-2">
    <span className="h-2 w-2 bg-indigo-400 rounded-full"></span>
    <span>{text}</span>
  </div>
);

const Stat = ({ value, label }) => (
  <div>
    <h3 className="text-2xl font-bold">{value}</h3>
    <p className="text-sm text-white/70">{label}</p>
  </div>
);

export default Welcome;
