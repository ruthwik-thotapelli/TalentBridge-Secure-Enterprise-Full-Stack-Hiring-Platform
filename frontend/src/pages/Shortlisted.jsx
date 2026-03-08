import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplications } from "../services/jobService";

export default function Shortlisted() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const apps = await getApplications();
        const accepted = (apps || []).filter((a) => a.status === "Accepted");
        setList(accepted);
      } catch (error) {
        console.error("Failed to load shortlisted candidates:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-white bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 sm:mb-8 w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition font-medium"
        >
          Back to Dashboard
        </button>

        <div className="mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
            🎉 Shortlisted Candidates
          </h1>
          <p className="text-white/70 mt-3 text-sm sm:text-base">
            These candidates have been approved by admin.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white/10 border border-white/10 p-6 sm:p-8 text-white/70">
            Loading shortlisted candidates...
          </div>
        ) : list.length === 0 ? (
          <div className="bg-white/10 border border-white/10 rounded-2xl p-6 sm:p-8 text-white/70">
            No candidates shortlisted yet.
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {list.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl sm:rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.35)] p-5 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold break-words">
                      {a.fullName || "Candidate"}
                    </h2>

                    <p className="text-white/70 mt-1 break-all">
                      {a.userEmail || "No email"}
                    </p>

                    <p className="text-white/60 mt-2 text-sm sm:text-base break-words">
                      {a.jobTitle || "Role not available"} • {a.company || "Company not available"}
                    </p>
                  </div>

                  <div className="w-full lg:w-auto">
                    <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-green-500/20 text-green-300 border border-green-400/30 text-sm font-medium w-full sm:w-auto">
                      ✅ Shortlisted
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {a.resumeName && (
                    <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/70 break-words">
                      <span className="text-white/90 font-medium">Resume:</span> {a.resumeName}
                    </div>
                  )}

                  {a.appliedAt && (
                    <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/70 break-words">
                      <span className="text-white/90 font-medium">Applied At:</span> {a.appliedAt}
                    </div>
                  )}
                </div>

                {typeof a.atsScore === "number" && (
                  <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-200 text-sm">
                    ATS Score: <span className="ml-2 font-bold">{a.atsScore}/100</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}