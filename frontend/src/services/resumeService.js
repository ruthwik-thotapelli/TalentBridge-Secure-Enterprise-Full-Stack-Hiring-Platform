import api from "./api";

function getToken() {
  return localStorage.getItem("token");
}

export async function scoreResume(file, jobDescription = "") {
  const fd = new FormData();
  fd.append("resume", file);
  fd.append("jobDescription", jobDescription);

  const res = await api.post("/resume/score", fd, {
    headers: {
      Authorization: `Bearer ${getToken() || ""}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}

export async function getATSHistory() {
  const res = await api.get("/resume/history", {
    headers: {
      Authorization: `Bearer ${getToken() || ""}`,
    },
  });

  return res.data;
}