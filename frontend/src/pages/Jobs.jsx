import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs, saveJob } from "../services/jobService";

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());

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

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 text-white bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-extrabold mb-4">Explore Opportunities</h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Discover jobs that match your skills, experience, and career goals.
          </p>
        </div>

        {/* Jobs List */}
        <div className="space-y-8">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/10
                         shadow-[0_20px_80px_rgba(0,0,0,0.35)] p-8"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-6">
                <div className="flex gap-5">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg">
                    {job.company?.[0] || "J"}
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold">{job.title}</h2>
                    <p className="text-white/70">
                      {job.company} • {job.location}
                    </p>

                    <div className="flex flex-wrap gap-3 mt-3">
                      <Tag label={job.type} />
                      <Tag label={job.experience} />
                      <Tag label={job.salary || "Salary not disclosed"} />
                    </div>
                  </div>
                </div>

                <div className="text-sm text-white/60 text-right">
                  <p>🕒 {job.posted || "Recently"}</p>
                  <p>👥 {job.applicants || 0}+ applicants</p>
                </div>
              </div>

              <p className="text-white/80 mt-6 max-w-4xl">{job.description}</p>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="px-8 py-3 rounded-xl font-semibold
                             bg-gradient-to-r from-purple-500 to-indigo-500
                             hover:opacity-90 transition"
                >
                  View Details
                </button>

                <button
                  onClick={() => handleSave(job)}
                  disabled={savedIds.has(job.id)}
                  className={`px-6 py-3 rounded-xl bg-white/10 border border-white/10 transition
                    ${
                      savedIds.has(job.id)
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-white/20"
                    }
                  `}
                >
                  {savedIds.has(job.id) ? "Saved ✅" : "Save Job ⭐"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Tag = ({ label }) => (
  <span className="px-4 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-white/80">
    {label}
  </span>
);

export default Jobs;
