/**
 * parse-apify-results.js
 *
 * Sanitized n8n Code node logic for parsing job results from Apify.
 * This script is intended to document the workflow logic, not run directly
 * without n8n context.
 */

const results = $input.all();
const jobs = [];
const seen = new Set();

function stripHtml(html) {
  if (!html) return '';

  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(li|p|div|h[1-6])[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeJobUrl(rawJobLink) {
  const raw = String(rawJobLink || '').trim();
  if (!raw) return '';

  const jobIdMatch = raw.match(/\/jobs\/view\/(?:[^\/?#]+-)?(\d+)/);

  if (jobIdMatch && jobIdMatch[1]) {
    return `https://www.linkedin.com/jobs/view/${jobIdMatch[1]}`;
  }

  return raw.split('?')[0].replace(/\/$/, '');
}

function buildDuplicateKey(jobLink, company, title, location) {
  if (jobLink) return jobLink;

  return [
    String(company || '').toLowerCase().trim(),
    String(title || '').toLowerCase().trim(),
    String(location || '').toLowerCase().trim()
  ].join('|');
}

const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)
  .toISOString()
  .slice(0, 10);

for (const item of results) {
  const j = item.json || {};

  const rawJobLink = j.link || j.jobUrl || j.url || '';
  const jobLink = normalizeJobUrl(rawJobLink);

  const title = j.title || 'No Title';
  const company = j.companyName || j.company || 'Unknown Company';
  const location = j.location || 'Unknown Location';
  const postedAt = j.postedAt || '';

  const duplicateKey = buildDuplicateKey(jobLink, company, title, location);

  if (!duplicateKey || seen.has(duplicateKey)) continue;
  if (postedAt && postedAt < sevenDaysAgo) continue;

  const jobDescription = j.descriptionHtml
    ? stripHtml(j.descriptionHtml)
    : String(j.descriptionText || j.description || '').trim();

  if (!jobDescription || jobDescription.length < 50) continue;

  jobs.push({
    title,
    company,
    location,
    postedAt,
    employmentType: j.employmentType || '',
    seniorityLevel: j.seniorityLevel || '',
    jobLink,
    jobKey: duplicateKey,
    jobDescription
  });

  seen.add(duplicateKey);

  if (jobs.length >= 20) break;
}

return jobs.map(job => ({ json: job }));