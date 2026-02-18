import fs from "fs";
import mammoth from "mammoth";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// pdf-parse v1.1.1 exports a function (CommonJS)
const pdfParse = require("pdf-parse");

export async function extractResumeText(filePath, mimetype) {
  if (mimetype === "application/pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return (data.text || "").trim();
  }

  // DOCX
  const result = await mammoth.extractRawText({ path: filePath });
  return (result.value || "").trim();
}
