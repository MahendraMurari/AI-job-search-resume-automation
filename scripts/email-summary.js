/**
 * email-summary.js
 *
 * Sanitized n8n Code node logic for creating a daily HTML email summary
 * with job links and generated Google Drive resume links.
 */

const esc = value =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const today = new Date().toISOString().slice(0, 10);

const metadataItems = $('Prep PDF Metadata').all();
const uploadItems = $('Upload PDF to Drive').all();

const maxLen = Math.max(metadataItems.length, uploadItems.length);

const processedItems = [];

for (let index = 0; index < maxLen; index++) {
  const meta = metadataItems[index]?.json || {};
  const uploadData = uploadItems[index]?.json || {};

  const pdfId = uploadData.id || uploadData.fileId || '';

  const pdfLink =
    uploadData.webViewLink ||
    uploadData.webContentLink ||
    uploadData.alternateLink ||
    (pdfId ? `https://drive.google.com/file/d/${pdfId}/view` : '');

  processedItems.push({
    company: meta.company || '',
    roleName: meta.title || meta.roleName || '',
    postedAt: meta.postedAt || '',
    jobLink: meta.jobLink || '',
    pdfLink
  });
}

let body = `
<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#222;">
  <h2>Your ATS resumes are ready (${processedItems.length})</h2>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <table style="border-collapse:collapse;width:100%;">
    <thead>
      <tr>
        <th style="text-align:left;padding:10px;border-bottom:2px solid #ddd;">Company</th>
        <th style="text-align:left;padding:10px;border-bottom:2px solid #ddd;">Role</th>
        <th style="text-align:left;padding:10px;border-bottom:2px solid #ddd;">Posted</th>
        <th style="text-align:left;padding:10px;border-bottom:2px solid #ddd;">Job</th>
        <th style="text-align:left;padding:10px;border-bottom:2px solid #ddd;">Resume</th>
      </tr>
    </thead>
    <tbody>
`;

for (const item of processedItems) {
  const jobCell = item.jobLink
    ? `<a href="${esc(item.jobLink)}">View Job</a>`
    : `<span style="color:#999;">No job link</span>`;

  const resumeCell = item.pdfLink
    ? `<a href="${esc(item.pdfLink)}">PDF Resume</a>`
    : `<span style="color:#c00;">No PDF link</span>`;

  body += `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #eee;font-weight:700;">${esc(item.company)}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;">${esc(item.roleName)}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;">${esc(item.postedAt)}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;">${jobCell}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;">${resumeCell}</td>
      </tr>
  `;
}

body += `
    </tbody>
  </table>
  <p style="color:#aaa;font-size:11px;margin-top:16px;">ATS Resume Agent — ${today}</p>
</div>
`;

return [
  {
    json: {
      subject: `ATS Resumes Ready (${processedItems.length}) — ${today}`,
      body
    }
  }
];