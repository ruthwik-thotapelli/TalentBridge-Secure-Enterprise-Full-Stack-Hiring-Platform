import PDFDocument from "pdfkit";

export function buildATSPdfBuffer(report) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: "A4" });

      const chunks = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // ---- Helpers
      const H1 = (t) => doc.fontSize(18).font("Helvetica-Bold").text(t).moveDown(0.4);
      const H2 = (t) => doc.fontSize(12).font("Helvetica-Bold").text(t).moveDown(0.2);
      const P = (t) => doc.fontSize(10).font("Helvetica").text(t).moveDown(0.2);

      const safeParse = (v, fallback) => {
        try {
          if (!v) return fallback;
          return typeof v === "string" ? JSON.parse(v) : v;
        } catch {
          return fallback;
        }
      };

      const breakdown = safeParse(report.breakdown_json, {});
      const sectionStatus = safeParse(report.section_status_json, {});
      const checklist = safeParse(report.checklist_json, []);
      const issues = safeParse(report.issues_json, []);
      const fixes = safeParse(report.fixes_json, []);
      const examples = safeParse(report.examples_json, []);

      // ---- Header
      H1("TalentBridge ATS Report");
      P(`Generated: ${new Date(report.created_at).toLocaleString()}`);
      P(`Resume: ${report.resume_name || "resume"}`);
      if (report.job_desc_snippet) P(`Job Desc: ${report.job_desc_snippet.slice(0, 220)}${report.job_desc_snippet.length > 220 ? "..." : ""}`);
      doc.moveDown(0.6);

      // ---- Score box
      H2("Score Summary");
      P(`Score: ${report.score}/100`);
      P(`Level: ${report.level}`);
      if (report.keyword_match_percent !== null && report.keyword_match_percent !== undefined) {
        P(`Keyword Match: ${report.keyword_match_percent}%`);
      }
      doc.moveDown(0.6);

      // ---- Breakdown
      H2("Breakdown");
      P(`Keywords: ${breakdown.keywords ?? "-"}`);
      P(`Sections: ${breakdown.sections ?? "-"}`);
      P(`Format: ${breakdown.format ?? "-"}`);
      doc.moveDown(0.6);

      // ---- Sections
      H2("Section Status");
      Object.entries(sectionStatus || {}).forEach(([k, v]) => {
        P(`${k}: ${v ? "OK" : "Missing"}`);
      });
      doc.moveDown(0.6);

      // ---- Checklist
      H2("ATS Checklist");
      (checklist || []).slice(0, 30).forEach((c) => {
        P(`- ${c.label}: ${c.pass ? "PASS" : "FAIL"}`);
      });
      doc.moveDown(0.6);

      // ---- Issues
      H2("Detected Issues");
      if (!issues || issues.length === 0) {
        P("No major issues found ✅");
      } else {
        issues.slice(0, 40).forEach((iss) => {
          P(`- [${(iss.severity || "low").toUpperCase()}] ${iss.message} (${iss.type || "-"})`);
          if (iss.fix) P(`  Fix: ${iss.fix}`);
        });
      }
      doc.moveDown(0.6);

      // ---- Fixes
      H2("Action Plan (Fixes)");
      if (!fixes || fixes.length === 0) {
        P("No fixes suggested ✅");
      } else {
        fixes.slice(0, 40).forEach((f) => P(`- ${f}`));
      }
      doc.moveDown(0.6);

      // ---- Examples
      H2("Rewrite Examples");
      if (!examples || examples.length === 0) {
        P("No rewrite examples generated ✅");
      } else {
        examples.slice(0, 10).forEach((ex) => {
          P(`${ex.title}`);
          P(`Bad: ${ex.bad}`);
          P(`Good: ${ex.good}`);
          doc.moveDown(0.2);
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
