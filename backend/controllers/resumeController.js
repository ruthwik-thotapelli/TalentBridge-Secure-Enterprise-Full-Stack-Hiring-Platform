import { extractResumeText } from "../utils/resumeParser.js";
import { scoreResumeATS } from "../utils/atsScorer.js";
import { saveATSReport } from "./atsHistoryController.js";

export const uploadAndScoreResume = async (req, res) => {
  try {
    const file = req.file;
    const jobDescription = req.body.jobDescription || "";

    if (!file) {
      return res.status(400).json({
        ok: false,
        message: "Resume file required",
      });
    }

    const text = await extractResumeText(file.path, file.mimetype);

    if (!text || text.length < 30) {
      return res.status(400).json({
        ok: false,
        message: "Could not extract readable text from resume. Try another PDF/DOCX.",
      });
    }

    const result = scoreResumeATS(text, jobDescription);

    await saveATSReport({
      userId: req.user?.id || null,
      resumeName: file.originalname,
      score: result.score,
      level: result.level,
      keywordMatchPercent: result.keywordMatchPercent,
      breakdown: result.breakdown,
      sectionStatus: result.sectionStatus,
      checklist: result.checklist,
      issues: result.issues,
      fixes: result.fixes,
      examples: result.examples,
      jobDesc: jobDescription,
    });

    return res.json({
      ok: true,
      extractedChars: text.length,
      ...result,
    });
  } catch (err) {
    console.error("ATS scoring error:", err);
    return res.status(500).json({
      ok: false,
      message: "Server error while scoring ATS",
      error: err.message,
    });
  }
};