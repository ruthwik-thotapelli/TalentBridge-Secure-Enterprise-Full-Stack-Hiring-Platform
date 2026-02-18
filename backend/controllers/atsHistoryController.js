import db from "../config/db.js";
import { buildATSPdfBuffer } from "../utils/atsPdf.js";

// ✅ Save report (returns reportId)
export const saveATSReport = async ({
  userId,
  resumeName,
  score,
  level,
  keywordMatchPercent,
  breakdown,
  sectionStatus,
  checklist,
  issues,
  fixes,
  examples,
  jobDesc,
}) => {
  const jobDescSnippet = (jobDesc || "").slice(0, 500);

  const [result] = await db.query(
    `INSERT INTO ats_reports
      (user_id, resume_name, score, level, keyword_match_percent,
       breakdown_json, section_status_json, checklist_json, issues_json,
       fixes_json, examples_json, job_desc_snippet)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      userId || null,
      resumeName || null,
      score,
      level,
      keywordMatchPercent ?? null,
      JSON.stringify(breakdown || {}),
      JSON.stringify(sectionStatus || {}),
      JSON.stringify(checklist || []),
      JSON.stringify(issues || []),
      JSON.stringify(fixes || []),
      JSON.stringify(examples || []),
      jobDescSnippet,
    ]
  );

  return result.insertId; // ✅ important for download
};

// ✅ Get history (latest 10)
export const getATSHistory = async (req, res) => {
  try {
    const userId = req.user?.id || null;

    // logged in -> only their history
    // guest -> global last 10 (your choice)
    const [rows] = userId
      ? await db.query(
          `SELECT id, resume_name, score, level, keyword_match_percent, created_at,
                  breakdown_json, section_status_json, checklist_json,
                  issues_json, fixes_json, examples_json, job_desc_snippet
           FROM ats_reports
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT 10`,
          [userId]
        )
      : await db.query(
          `SELECT id, resume_name, score, level, keyword_match_percent, created_at,
                  breakdown_json, section_status_json, checklist_json,
                  issues_json, fixes_json, examples_json, job_desc_snippet
           FROM ats_reports
           ORDER BY created_at DESC
           LIMIT 10`
        );

    const history = rows.map((r) => ({
      id: r.id,
      resumeName: r.resume_name,
      score: r.score,
      level: r.level,
      keywordMatchPercent: r.keyword_match_percent,
      createdAt: r.created_at,
      jobDescSnippet: r.job_desc_snippet,
      breakdown: safeJson(r.breakdown_json, {}),
      sectionStatus: safeJson(r.section_status_json, {}),
      checklist: safeJson(r.checklist_json, []),
      issues: safeJson(r.issues_json, []),
      fixes: safeJson(r.fixes_json, []),
      examples: safeJson(r.examples_json, []),
    }));

    return res.json({ ok: true, history });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

// ✅ NEW: Download ATS report PDF by report id
export const downloadATSReportPDF = async (req, res) => {
  try {
    const reportId = Number(req.params.id);
    if (!reportId) {
      return res.status(400).json({ ok: false, message: "Invalid report id" });
    }

    const userId = req.user?.id || null;

    // ✅ Security: only allow logged-in users to download THEIR report
    if (!userId) {
      return res
        .status(401)
        .json({ ok: false, message: "Login required to download PDF" });
    }

    const [rows] = await db.query(
      "SELECT * FROM ats_reports WHERE id=? AND user_id=?",
      [reportId, userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ ok: false, message: "Report not found" });
    }

    const report = rows[0];
    const buffer = await buildATSPdfBuffer(report);

    const filenameBase = (report.resume_name || "ats-report")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_\.]/g, "")
      .slice(0, 40);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filenameBase}-ATS-${report.id}.pdf"`
    );

    return res.send(buffer);
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
};

function safeJson(v, fallback) {
  try {
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
