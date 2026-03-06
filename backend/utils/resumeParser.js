import fs from "fs";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export async function extractResumeText(filePath, mimetype) {
  try {
    if (mimetype === "application/pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return (data.text || "").trim();
    }

    if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return (result.value || "").trim();
    }

    throw new Error("Unsupported file format");
  } catch (err) {
    console.error("Resume parsing failed:", err);
    throw new Error("Failed to extract text from resume");
  }
}