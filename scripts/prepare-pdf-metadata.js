/**
 * prepare-pdf-metadata.js
 *
 * Sanitized n8n Code node logic for preparing clean PDF metadata
 * and safe file names after LaTeX compilation.
 */

const src = $('Build LaTeX Resume').item.json;

const company = src.company || '';
const title = src.title || '';
const postedAtRaw = src.postedAt || new Date().toISOString();
const jobLink = src.jobLink || '';
const jobKey = src.jobKey || '';
const location = src.location || '';
const employmentType = src.employmentType || '';
const seniorityLevel = src.seniorityLevel || '';
const jobDescription = src.jobDescription || '';
const output = src.output || '';

const postedAt = String(postedAtRaw).slice(0, 10);

function safeName(value, maxLen) {
  return String(value || '')
    .replace(/[\/\\:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

const safeCompany = safeName(company || 'Unknown Company', 60);
const safeTitle = safeName(title || 'Unknown Role', 80);

/**
 * Portfolio version:
 * Keep public example naming simple and readable.
 *
 * Production workflow can use:
 * `${safeCompany} - ${safeTitle} - ${postedAt}`
 */
const docTitle = `${safeCompany} - ${safeTitle}`;

return {
  json: {
    output,
    docTitle,
    company,
    title,
    roleName: safeTitle,
    postedAt,
    jobLink,
    jobKey,
    location,
    employmentType,
    seniorityLevel,
    jobDescription
  },
  binary: {
    data: $input.item.binary.pdfData
  }
};