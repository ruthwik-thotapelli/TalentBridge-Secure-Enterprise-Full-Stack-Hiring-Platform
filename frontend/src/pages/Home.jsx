import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white">
      {/* HERO */}
      <section className="px-4 sm:px-6 pt-24 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-5 sm:mb-6">
              Find the Right Job, <br />
              <span className="text-purple-300">Build Your Career</span>
            </h1>

            <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-8 max-w-2xl mx-auto md:mx-0">
              TalentBridge connects students and professionals with top companies.
              Apply smarter, track applications, and grow faster.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center md:justify-start">
              <button
                onClick={() => navigate("/jobs")}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-green-400 to-emerald-500 hover:scale-[1.03] transition"
              >
                Explore Jobs
              </button>

              <button
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-semibold bg-white/20 border border-white/30 hover:bg-white/30 transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 backdrop-blur-xl rounded-3xl p-5 sm:p-6 lg:p-8 grid grid-cols-2 gap-4 sm:gap-6">
            <Stat value="10K+" label="Active Jobs" />
            <Stat value="5K+" label="Companies" />
            <Stat value="50K+" label="Candidates" />
            <Stat value="95%" label="Success Rate" />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24 bg-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-14 lg:mb-16">
            How TalentBridge Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Step
              number="01"
              title="Create Profile"
              desc="Build a strong professional profile with your skills, experience, and resume."
            />

            <Step
              number="02"
              title="Apply for Jobs"
              desc="Browse verified jobs and apply easily with a single click."
            />

            <Step
              number="03"
              title="Track Progress"
              desc="Monitor applications, interviews, and responses from your dashboard."
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 sm:mb-14 lg:mb-16">
            Why Choose TalentBridge
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-10">
            <Feature
              title="Smart Job Matching"
              desc="Personalized job recommendations based on your skills and interests."
            />

            <Feature
              title="Resume Management"
              desc="Upload, update, and manage resumes in one secure place."
            />

            <Feature
              title="Real-Time Updates"
              desc="Get instant updates on application status and recruiter actions."
            />

            <Feature
              title="Career Growth Focused"
              desc="Designed especially for students, freshers, and working professionals."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16 sm:py-20 lg:py-24 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-5 sm:mb-6">
            Ready to Take the Next Step?
          </h2>

          <p className="text-white/90 text-sm sm:text-base lg:text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of candidates who found their dream job using TalentBridge.
          </p>

          <button
            onClick={() => navigate("/jobs")}
            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold bg-white text-purple-700 hover:bg-gray-100 transition"
          >
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
};

const Stat = ({ value, label }) => (
  <div className="text-center">
    <h3 className="text-2xl sm:text-3xl font-bold text-purple-300">{value}</h3>
    <p className="text-sm sm:text-base text-white/80">{label}</p>
  </div>
);

const Step = ({ number, title, desc }) => (
  <div className="bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 text-center">
    <div className="text-purple-300 text-3xl sm:text-4xl font-bold mb-4">
      {number}
    </div>
    <h3 className="text-lg sm:text-xl font-semibold mb-2">{title}</h3>
    <p className="text-sm sm:text-base text-white/80">{desc}</p>
  </div>
);

const Feature = ({ title, desc }) => (
  <div className="bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8">
    <h3 className="text-lg sm:text-xl font-semibold mb-3">{title}</h3>
    <p className="text-sm sm:text-base text-white/80">{desc}</p>
  </div>
);

export default Home;