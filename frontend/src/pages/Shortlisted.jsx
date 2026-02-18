import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApplications } from "../services/jobService";

export default function Shortlisted() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);

  useEffect(() => {
    const load = async () => {
      const apps = await getApplications();
      const accepted = apps.filter((a) => a.status === "Accepted");
      setList(accepted);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 text-white bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-8 px-6 py-2 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 transition"
        >
          Back to Dashboard
        </button>

        <h1 className="text-4xl font-extrabold mb-6">
          🎉 Shortlisted Candidates
        </h1>

        <p className="text-white/70 mb-10">
          These candidates have been approved by admin.
        </p>

        {list.length === 0 ? (
          <div className="bg-white/10 border border-white/10 rounded-2xl p-8 text-white/70">
            No candidates shortlisted yet.
          </div>
        ) : (
          <div className="space-y-6">
            {list.map((a) => (
              <div
                key={a.id}
                className="rounded-3xl bg-white/[0.07] backdrop-blur-2xl border border-white/10
                           shadow-[0_20px_80px_rgba(0,0,0,0.35)] p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {a.fullName || "Candidate"}
                    </h2>
                    <p className="text-white/70">
                      {a.userEmail}
                    </p>
                    <p className="text-white/60 mt-1">
                      {a.jobTitle} • {a.company}
                    </p>
                  </div>

                  <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-300 border border-green-400/30">
                    ✅ Shortlisted
                  </span>
                </div>

                {a.resumeName && (
                  <p className="text-white/60 text-sm mt-4">
                    Resume: {a.resumeName}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
