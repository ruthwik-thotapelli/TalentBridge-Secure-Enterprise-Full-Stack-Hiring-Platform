import jobsData from "../data/jobsData";

const JOBS_KEY = "jobs";
const APPS_KEY = "applications";
const SAVED_KEY = "savedJobs";

/* =========================
   INIT JOBS (First Time Only)
========================= */

const initJobs = () => {
  const existing = JSON.parse(localStorage.getItem(JOBS_KEY));
  if (!existing || existing.length === 0) {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobsData));
  }
};

/* =========================
   JOBS (Admin + User)
========================= */

export const getJobs = async () => {
  initJobs();
  return JSON.parse(localStorage.getItem(JOBS_KEY)) || [];
};

export const getJobById = async (id) => {
  initJobs();
  const jobs = JSON.parse(localStorage.getItem(JOBS_KEY)) || [];
  return jobs.find((j) => j.id === Number(id)) || null;
};

export const addJob = async (job) => {
  initJobs();
  const jobs = JSON.parse(localStorage.getItem(JOBS_KEY)) || [];

  const newJob = {
    ...job,
    id: Date.now(),
    posted: "Recently",
    applicants: 0,
  };

  jobs.unshift(newJob);
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  return jobs;
};

export const updateJob = async (updatedJob) => {
  const jobs = JSON.parse(localStorage.getItem(JOBS_KEY)) || [];

  const updated = jobs.map((job) =>
    job.id === updatedJob.id ? updatedJob : job
  );

  localStorage.setItem(JOBS_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteJob = async (id) => {
  const jobs = JSON.parse(localStorage.getItem(JOBS_KEY)) || [];
  const updated = jobs.filter((j) => j.id !== Number(id));
  localStorage.setItem(JOBS_KEY, JSON.stringify(updated));
  return updated;
};

/* =========================
   APPLY (User → Admin)
========================= */

export const applyForJob = async ({ job, applicant }) => {
  const applications = JSON.parse(localStorage.getItem(APPS_KEY)) || [];

  const email = applicant?.email || "guest@gmail.com";

  const alreadyApplied = applications.some(
    (a) => a.jobId === job.id && a.userEmail === email
  );

  if (!alreadyApplied) {
    // OPTIONAL: If you saved latest ATS in localStorage, attach to application
    let atsScore = null;
    try {
      const latestATS = JSON.parse(localStorage.getItem("latestATS") || "null");
      if (latestATS && typeof latestATS.score === "number") {
        atsScore = latestATS.score;
      }
    } catch {}

    applications.unshift({
      id: Date.now(),
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,

      // Candidate Details
      fullName: applicant?.fullName || "Guest User",
      userEmail: email,
      phone: applicant?.phone || "",
      linkedin: applicant?.linkedin || "",
      skills: applicant?.skills || "",
      coverNote: applicant?.coverNote || "",

      // Resume
      resumeName: applicant?.resumeName || "resume.pdf",
      resumeDataUrl: applicant?.resumeDataUrl || "",

      // NEW: ATS score attached (optional)
      atsScore,

      // NEW: Internal note (optional)
      note: "",

      // Status
      status: "Pending", // Pending | Shortlisted | Accepted | Rejected
      appliedAt: new Date().toLocaleString(),
    });

    // Increase job applicant count
    const jobs = JSON.parse(localStorage.getItem(JOBS_KEY)) || [];
    const updatedJobs = jobs.map((j) =>
      j.id === job.id
        ? { ...j, applicants: (j.applicants || 0) + 1 }
        : j
    );

    localStorage.setItem(JOBS_KEY, JSON.stringify(updatedJobs));
    localStorage.setItem(APPS_KEY, JSON.stringify(applications));
  }

  return applications;
};

export const getApplications = async () => {
  return JSON.parse(localStorage.getItem(APPS_KEY)) || [];
};

/* =========================
   ADMIN: UPDATE STATUS
========================= */

export const updateApplicationStatus = async (appId, newStatus) => {
  const applications = JSON.parse(localStorage.getItem(APPS_KEY)) || [];
  const idNum = Number(appId);

  const updated = applications.map((app) =>
    Number(app.id) === idNum ? { ...app, status: newStatus } : app
  );

  localStorage.setItem(APPS_KEY, JSON.stringify(updated));
  return updated;
};

/* ✅ Helper: Get only shortlisted */
export const getShortlistedApplications = async () => {
  const applications = JSON.parse(localStorage.getItem(APPS_KEY)) || [];
  return applications.filter((a) => a.status === "Shortlisted");
};

/* ✅ Optional: Save internal note */
export const updateApplicationNote = async (appId, note) => {
  const applications = JSON.parse(localStorage.getItem(APPS_KEY)) || [];
  const idNum = Number(appId);

  const updated = applications.map((app) =>
    Number(app.id) === idNum ? { ...app, note } : app
  );

  localStorage.setItem(APPS_KEY, JSON.stringify(updated));
  return updated;
};

/* =========================
   SAVE JOB (User)
========================= */

export const saveJob = async (job) => {
  const savedJobs = JSON.parse(localStorage.getItem(SAVED_KEY)) || [];

  const alreadySaved = savedJobs.some((j) => j.id === job.id);

  if (!alreadySaved) {
    savedJobs.unshift(job);
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedJobs));
  }

  return savedJobs;
};

export const getSavedJobs = async () => {
  return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
};
