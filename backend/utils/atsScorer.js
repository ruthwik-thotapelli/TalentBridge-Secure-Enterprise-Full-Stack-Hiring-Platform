function normalize(text = "") {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function uniq(arr) {
  return [...new Set(arr)];
}

function extractEmails(text) {
  return uniq(text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || []);
}

function extractPhones(text) {
  const matches =
    text.match(/(\+?\d{1,3}[\s-]?)?(\(?\d{3,5}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}/g) || [];
  return uniq(matches.map((m) => m.trim())).filter((m) => m.replace(/\D/g, "").length >= 10);
}

function extractLinks(text) {
  const links = uniq(text.match(/https?:\/\/[^\s)]+/gi) || []);
  const hasLinkedIn = links.some((l) => l.toLowerCase().includes("linkedin.com"));
  const hasGitHub = links.some((l) => l.toLowerCase().includes("github.com"));
  return { links, hasLinkedIn, hasGitHub };
}

function hasBullets(raw) {
  return raw.includes("•") || raw.includes("- ") || raw.includes("– ") || raw.includes("· ");
}

function hasDates(t) {
  return (
    /\b(19|20)\d{2}\b/.test(t) ||
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/.test(t)
  );
}

function sectionPresent(t, keys) {
  return keys.some((k) => t.includes(k));
}

function extractKeywords(jdText) {
  const stop = new Set([
    "the","and","for","with","to","in","of","a","an","is","are","on","as","at",
    "you","your","we","our","will","have","has","be","this","that","from","or","by"
  ]);

  const words = normalize(jdText)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(" ")
    .filter((w) => w.length >= 3 && !stop.has(w));

  return uniq(words).slice(0, 35);
}

function severityForIssue(type) {
  if (type === "format") return "high";
  if (type === "section") return "medium";
  return "low";
}

export function scoreResumeATS(resumeText, jobDescription = "") {
  const raw = resumeText || "";
  const t = normalize(raw);
  const jd = normalize(jobDescription);

  // -------------------------
  // SECTION CHECKS
  // -------------------------
  const sections = {
    education: ["education", "academic", "b.tech", "bachelor", "masters", "university", "college"],
    skills: ["skills", "technical skills", "technologies", "tool", "tooling"],
    experience: ["experience", "work experience", "internship", "employment", "professional experience"],
    projects: ["projects", "project", "personal projects", "academic projects"],
  };

  const sectionStatus = {
    education: sectionPresent(t, sections.education),
    skills: sectionPresent(t, sections.skills),
    experience: sectionPresent(t, sections.experience),
    projects: sectionPresent(t, sections.projects),
  };

  // -------------------------
  // FORMAT CHECKLIST
  // -------------------------
  const emails = extractEmails(raw);
  const phones = extractPhones(raw);
  const { links, hasLinkedIn, hasGitHub } = extractLinks(raw);

  const checklist = [
    { key: "email", label: "Email present", pass: emails.length > 0 },
    { key: "phone", label: "Phone present", pass: phones.length > 0 },
    { key: "linkedin", label: "LinkedIn link present", pass: hasLinkedIn },
    { key: "github", label: "GitHub link present", pass: hasGitHub },
    { key: "dates", label: "Dates/timelines present", pass: hasDates(t) },
    { key: "bullets", label: "Bullet points used", pass: hasBullets(raw) },
  ];

  const wordCount = t.split(" ").filter(Boolean).length;

  // -------------------------
  // KEYWORDS (Resume vs JD)
  // -------------------------
  let matchedKeywords = [];
  let missingKeywords = [];
  let keywordMatchPercent = null;

  if (jd.length > 20) {
    const keywords = extractKeywords(jd);
    keywords.forEach((k) => {
      if (t.includes(k)) matchedKeywords.push(k);
      else missingKeywords.push(k);
    });

    keywordMatchPercent = Math.round(
      (matchedKeywords.length / Math.max(1, keywords.length)) * 100
    );
  }

  // -------------------------
  // SCORING
  // -------------------------
  // Total 100
  // 35 keywords + 35 sections + 30 format/quality
  const breakdown = { keywords: 0, sections: 0, format: 0 };

  // keywords score
  if (jd.length > 20 && keywordMatchPercent !== null) {
    breakdown.keywords = Math.round((keywordMatchPercent / 100) * 35);
  } else {
    breakdown.keywords = 15; // baseline when no JD
  }

  // sections score (max 35)
  const secPoints = {
    education: sectionStatus.education ? 8 : 0,
    skills: sectionStatus.skills ? 9 : 0,
    experience: sectionStatus.experience ? 9 : 0,
    projects: sectionStatus.projects ? 9 : 0,
  };
  breakdown.sections =
    secPoints.education + secPoints.skills + secPoints.experience + secPoints.projects;

  const allSectionsPresent =
    sectionStatus.education &&
    sectionStatus.skills &&
    sectionStatus.experience &&
    sectionStatus.projects;

  if (allSectionsPresent) breakdown.sections = Math.min(35, breakdown.sections + 3);

  // format/quality score (max 30)
  const passed = checklist.filter((c) => c.pass).length;
  breakdown.format += Math.round((passed / checklist.length) * 18); // up to 18

  // length quality (up to 12)
  if (wordCount >= 250 && wordCount <= 900) breakdown.format += 12;
  else if (wordCount >= 180) breakdown.format += 8;
  else breakdown.format += 4;

  let score = breakdown.keywords + breakdown.sections + breakdown.format;
  score = Math.max(0, Math.min(100, score));

  // -------------------------
  // Suggestions (actionable)
  // -------------------------
  const fixes = [];

  if (emails.length === 0) fixes.push("Add an email address at the top.");
  if (phones.length === 0) fixes.push("Add a phone number at the top.");
  if (!hasLinkedIn) fixes.push("Add your LinkedIn profile link.");
  if (!hasGitHub) fixes.push("Add your GitHub link (if you have projects).");
  if (!hasBullets(raw)) fixes.push("Use bullet points for impact-based achievements.");
  if (!hasDates(t)) fixes.push("Add dates for education/experience (e.g., Jan 2026 – Mar 2026).");

  if (!sectionStatus.skills) fixes.push("Add a clear Skills section with tools/tech.");
  if (!sectionStatus.projects) fixes.push("Add a Projects section with 2–3 projects and results.");
  if (!sectionStatus.experience) fixes.push("Add Internship/Experience section (even small ones).");
  if (!sectionStatus.education) fixes.push("Add Education section (college, degree, year).");

  if (jd.length > 20 && keywordMatchPercent !== null && keywordMatchPercent < 60) {
    fixes.push("Add missing job keywords (only if you truly know them).");
  }
  if (jd.length <= 20) {
    fixes.push("Paste a Job Description for a more accurate ATS score.");
  }

  if (wordCount < 180) fixes.push("Resume is too short. Add more detail & measurable outcomes.");
  if (wordCount > 1000) fixes.push("Resume is too long. Keep it concise (1–2 pages).");

  // -------------------------
  // Detailed mistakes + examples
  // -------------------------
  const issues = [];

  checklist.forEach((c) => {
    if (!c.pass) {
      issues.push({
        type: "format",
        severity: severityForIssue("format"),
        field: c.key,
        message: `${c.label} is missing`,
        fix: fixes.find((f) => f.toLowerCase().includes(c.key)) || "",
      });
    }
  });

  Object.entries(sectionStatus).forEach(([k, v]) => {
    if (!v) {
      issues.push({
        type: "section",
        severity: severityForIssue("section"),
        field: k,
        message: `Missing section: ${k}`,
        fix: `Add a "${k.toUpperCase()}" heading with relevant details.`,
      });
    }
  });

  if (wordCount < 180) {
    issues.push({
      type: "content",
      severity: severityForIssue("content"),
      field: "length",
      message: "Resume content is too short",
      fix: "Add more bullet points with measurable impact (numbers, scale, results).",
    });
  }

  if (wordCount > 1000) {
    issues.push({
      type: "content",
      severity: severityForIssue("content"),
      field: "length",
      message: "Resume content is too long",
      fix: "Reduce to key achievements. Keep 1–2 pages.",
    });
  }

  const examples = [];
  if (!hasBullets(raw)) {
    examples.push({
      title: "Bullet Rewrite Example",
      bad: "Worked on backend APIs",
      good: "Built 8 REST APIs in Node.js + MySQL, improved response time by 35% via indexing and query optimization.",
    });
  }
  if (!hasDates(t)) {
    examples.push({
      title: "Date Formatting Example",
      bad: "Internship at Company",
      good: "Internship — Company | Jan 2026 – Mar 2026",
    });
  }
  if (jd.length > 20 && keywordMatchPercent !== null && keywordMatchPercent < 60) {
    examples.push({
      title: "Keyword Matching Example",
      bad: "Skills: Java, HTML, CSS",
      good: "Skills: Node.js, Express, MySQL, REST APIs, JWT, Docker, Git (aligned with JD keywords)",
    });
  }

  const insights = {
    wordCount,
    keywordAdvice:
      keywordMatchPercent !== null
        ? `Matched ${matchedKeywords.length} keywords, missing ${missingKeywords.length}.`
        : "Paste Job Description to calculate keyword match.",
    topFix: fixes[0] || "Improve formatting and add measurable achievements",
  };

  // Level
  let level = "Needs Improvement";
  if (score >= 80) level = "Strong";
  else if (score >= 60) level = "Good";
  else if (score >= 40) level = "Average";

  return {
    ok: true,
    score,
    level,

    breakdown,
    sectionStatus,

    keywordMatchPercent,
    matchedKeywords: matchedKeywords.slice(0, 25),
    missingKeywords: missingKeywords.slice(0, 25),

    checklist,
    detected: {
      wordCount,
      emails,
      phones,
      links: links.slice(0, 10),
    },

    fixes: fixes.slice(0, 12),

    // ✅ NEW
    issues,
    examples,
    insights,
  };
}
