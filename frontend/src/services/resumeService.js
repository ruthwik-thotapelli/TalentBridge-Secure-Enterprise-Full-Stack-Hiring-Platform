const API = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("token"); // your OAuth/Login token storage
}

export async function scoreResume(file, jobDescription = "") {
  const fd = new FormData();
  fd.append("resume", file);
  fd.append("jobDescription", jobDescription);

  const res = await fetch(`${API}/api/resume/score`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken() || ""}`,
    },
    body: fd,
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, message: text || `HTTP ${res.status}` };
  }
}

export async function getATSHistory() {
  const res = await fetch(`${API}/api/resume/history`, {
    headers: {
      Authorization: `Bearer ${getToken() || ""}`,
    },
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, message: text || `HTTP ${res.status}` };
  }
}
