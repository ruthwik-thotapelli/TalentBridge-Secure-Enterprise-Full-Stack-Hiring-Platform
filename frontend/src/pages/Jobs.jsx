import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, saveJob } from "../services/jobService";

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      const data = await getJobs();
      setJobs(data);

      const savedJobs = JSON.parse(localStorage.getItem("savedJobs")) || [];
      setSavedIds(new Set(savedJobs.map((j) => j.id)));
    };

    load();
  }, []);

  const handleSave = async (job) => {
    await saveJob(job);
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.add(job.id);
      return next;
    });
  };

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesQuery =
        !q ||
        job.title?.toLowerCase().includes(q) ||
        job.company?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q) ||
        job.description?.toLowerCase().includes(q);

      const matchesType = typeFilter === "All" || job.type === typeFilter;

      return matchesQuery && matchesType;
    });
  }, [jobs, query, typeFilter]);

  const jobTypes = useMemo(() => {
    const types = new Set(jobs.map((j) => j.type).filter(Boolean));
    return ["All", ...Array.from(types)];
  }, [jobs]);

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-10 sm:pb-16 px-4 sm:px-6 text-white bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8 sm:mb-10">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-fit px-5 sm:px-6 py-3 rounded-2xl font-semibold
                         bg-white/[0.08] border border-white/10 backdrop-blur-xl
                         hover:bg-white/[0.14] hover:border-white/20 transition
                         shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
            >
              Back to Dashboard
            </button>

            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                Explore Opportunities
              </h1>
              <p className="text-white/70 text-sm sm:text-base lg:text-lg max-w-2xl mt-2">
                Discover jobs that match your skills, experience, and career goals.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div
              className="flex items-center gap-3 rounded-2xl px-4 py-3
                         bg-white/[0.08] border border-white/10 backdrop-blur-xl
                         shadow-[0_12px_40px_rgba(0,0,0,0.25)] w-full md:w-[380px]"
            >
              <span className="text-white/60">🔎</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, company, location..."
                className="w-full bg-transparent outline-none placeholder:text-white/40 text-white/90 text-sm sm:text-base"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-white/60 hover:text-white transition"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-2xl px-4 py-3 bg-white/[0.08] border border-white/10
                         backdrop-blur-xl outline-none text-white/90
                         shadow-[0_12px_40px_rgba(0,0,0,0.25)] w-full sm:w-auto"
            >
              {jobTypes.map((t) => (
                <option key={t} value={t} className="bg-slate-950">
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6 text-white/70 text-sm sm:text-base">
          Showing <span className="font-semibold text-white">{filteredJobs.length}</span> jobs
        </div>

        {filteredJobs.length === 0 ? (
          <div
            className="rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/10
                       shadow-[0_20px_80px_rgba(0,0,0,0.35)] p-6 sm:p-10 text-center"
          >
            <h2 className="text-xl sm:text-2xl font-bold">No jobs found</h2>
            <p className="text-white/70 mt-2 text-sm sm:text-base">
              Try changing your search or filter.
            </p>
            <button
              onClick={() => {
                setQuery("");
                setTypeFilter("All");
              }}
              className="mt-6 px-6 sm:px-8 py-3 rounded-2xl font-semibold
                         bg-gradient-to-r from-purple-500 to-indigo-500
                         hover:opacity-90 transition w-full sm:w-auto"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/10
                           shadow-[0_20px_80px_rgba(0,0,0,0.35)] p-5 sm:p-6 lg:p-8"
              >
                <div className="flex flex-col md:flex-row md:justify-between gap-6">
                  <div className="flex gap-4 sm:gap-5 min-w-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 flex items-center justify-center font-bold text-base sm:text-lg shrink-0">
                      {job.company?.[0] || "J"}
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-xl sm:text-2xl font-bold break-words">{job.title}</h2>
                      <p className="text-white/70 text-sm sm:text-base break-words">
                        {job.company} • {job.location}
                      </p>

                      <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
                        <Tag label={job.type} />
                        <Tag label={job.experience} />
                        <Tag label={job.salary || "Salary not disclosed"} />
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-white/60 md:text-right">
                    <p>🕒 {job.posted || "Recently"}</p>
                    <p>👥 {job.applicants || 0}+ applicants</p>
                  </div>
                </div>

                <p className="text-white/80 mt-5 sm:mt-6 max-w-4xl line-clamp-3 text-sm sm:text-base">
                  {job.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-6 sm:mt-8">
                  <button
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-2xl font-semibold
                               bg-gradient-to-r from-purple-500 to-indigo-500
                               hover:opacity-90 transition
                               shadow-[0_14px_50px_rgba(99,102,241,0.25)]"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleSave(job)}
                    disabled={savedIds.has(job.id)}
                    className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-2xl font-semibold border transition ${
                      savedIds.has(job.id)
                        ? "opacity-60 cursor-not-allowed bg-white/10 border-white/10"
                        : "bg-white/[0.08] border-white/10 hover:bg-white/[0.14] hover:border-white/20"
                    }`}
                  >
                    {savedIds.has(job.id) ? "Saved" : "Save Job"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Tag = ({ label }) => (
  <span className="px-3 sm:px-4 py-1 rounded-full bg-white/10 border border-white/10 text-xs sm:text-sm text-white/80">
    {label}
  </span>
);

export default Jobs;