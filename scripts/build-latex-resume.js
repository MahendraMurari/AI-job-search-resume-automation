/**
 * build-latex-resume.js
 *
 * Sanitized n8n Code node logic for converting structured LLM resume text
 * into an ATS-friendly LaTeX document.
 *
 * This script is designed for n8n workflow documentation and may need
 * small adjustments before running outside n8n.
 */

const raw = ($json.output || '').trim();

function normalizeText(s) {
  return String(s || '')
    .replace(/[–—−]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/approximately\s+2530%/g, 'approximately 25-30%')
    .replace(/approximately\s+3040%/g, 'approximately 30-40%')
    .replace(/\b2530%\b/g, '25-30%')
    .replace(/\b3040%\b/g, '30-40%');
}

function esc(s) {
  return normalizeText(s)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

function section(text, header) {
  const escapedHeader = header
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/ /g, '\\s+');

  const re = new RegExp(
    '(?:^|\\n)' +
      escapedHeader +
      '\\s*\\n([\\s\\S]*?)(?=\\n[A-Z][A-Z &/]{2,}\\s*\\n|$)',
    'i'
  );

  const m = text.match(re);
  return m ? m[1].trim() : '';
}

function cleanLines(text) {
  return String(text || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

function bulletText(line) {
  return line.replace(/^[-•·]\s*/, '').trim();
}

const headlineRaw = section(raw, 'HEADLINE');
const summaryRaw = section(raw, 'SUMMARY');
const experienceRaw = section(raw, 'PROFESSIONAL EXPERIENCE');
const projectsRaw = section(raw, 'PROJECTS');
const skillsRaw = section(raw, 'SKILLS');
const educationRaw = section(raw, 'EDUCATION');
const certsRaw = section(raw, 'CERTIFICATIONS');

const fullName = '{{CANDIDATE_NAME}}';
const contactLine1 = '{{CANDIDATE_LOCATION}} | {{CANDIDATE_PHONE}} | {{CANDIDATE_EMAIL}}';
const contactLine2 = '{{CANDIDATE_LINKEDIN}}';
const headline = headlineRaw || 'AI/ML Engineer | GenAI, RAG, Python, APIs, Automation';

const summaryText = summaryRaw.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

function buildExperience(text) {
  const lines = cleanLines(text);
  const blocks = [];
  let current = [];

  for (const line of lines) {
    const isHeaderLine =
      line.includes('|') &&
      !line.startsWith('-') &&
      !line.startsWith('•') &&
      !line.startsWith('·');

    if (isHeaderLine && current.length >= 2) {
      blocks.push(current);
      current = [];
    }

    current.push(line);
  }

  if (current.length) blocks.push(current);

  let out = '';

  for (const block of blocks) {
    if (block.length < 2) continue;

    const [company, location] = (block[0] || '').split('|').map(s => s.trim());
    const [title, dates] = (block[1] || '').split('|').map(s => s.trim());

    const bullets = block
      .slice(2)
      .filter(line => /^[-•·]\s+/.test(line))
      .map(bulletText)
      .filter(Boolean)
      .slice(0, 6);

    out += `\\resumeSubheading{${esc(company)}}{${esc(location || '')}}{${esc(title || '')}}{${esc(dates || '')}}\n`;

    if (bullets.length) {
      out += '\\begin{itemize}[leftmargin=0.18in, itemsep=1pt, topsep=2pt]\n';

      for (const bullet of bullets) {
        out += `\\item ${esc(bullet)}\n`;
      }

      out += '\\end{itemize}\n';
    }
  }

  return out;
}

function buildProjects(text) {
  const lines = cleanLines(text);
  const blocks = [];
  let current = [];

  for (const line of lines) {
    const isProjectHeader = line.includes('|') && !/^[-•·]\s+/.test(line);

    if (isProjectHeader && current.length > 0) {
      blocks.push(current);
      current = [];
    }

    current.push(line);
  }

  if (current.length) blocks.push(current);

  let out = '';

  for (const block of blocks) {
    const [projectName, technologies] = (block[0] || '').split('|').map(s => s.trim());

    const bullets = block
      .slice(1)
      .filter(line => /^[-•·]\s+/.test(line))
      .map(bulletText)
      .filter(Boolean)
      .slice(0, 3);

    out += `\\projectHeading{${esc(projectName)}}{${esc(technologies || '')}}\n`;

    if (bullets.length) {
      out += '\\begin{itemize}[leftmargin=0.18in, itemsep=1pt, topsep=4pt]\n';

      for (const bullet of bullets) {
        out += `\\item ${esc(bullet)}\n`;
      }

      out += '\\end{itemize}\n';
    }
  }

  return out;
}

function buildSkills(text) {
  return cleanLines(text)
    .map(line => line.replace(/^[-•·]\s*/, '').trim())
    .filter(Boolean)
    .map(line => {
      const idx = line.indexOf(':');

      if (idx > 0) {
        const category = line.slice(0, idx).trim();
        const values = line.slice(idx + 1).trim();
        return `\\skillItem{${esc(category)}}{${esc(values)}}`;
      }

      return `\\skillItem{}{${esc(line)}}`;
    })
    .join('\n');
}

function buildEducation(text) {
  return cleanLines(text)
    .filter(line => !/^[-•·]\s+/.test(line))
    .map(line => `\\educationItem{${esc(line)}}`)
    .join('\n');
}

function buildCertifications(text) {
  return cleanLines(text)
    .map(bulletText)
    .filter(Boolean)
    .map(line => `\\certItem{${esc(line)}}`)
    .join('\n');
}

const latex = `\\documentclass[10.5pt,letterpaper]{article}

\\usepackage[margin=0.55in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{lmodern}
\\usepackage[none]{hyphenat}
\\sloppy
\\pagenumbering{gobble}

\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{0pt}
\\setlist[itemize]{noitemsep, topsep=2pt, parsep=0pt, partopsep=0pt}

\\titleformat{\\section}
  {\\large\\bfseries}
  {}
  {0pt}
  {}
  [\\vspace{2pt}\\titlerule\\vspace{3pt}]

\\titlespacing*{\\section}{0pt}{9pt}{6pt}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{2pt}
  \\begin{tabularx}{\\textwidth}{@{}X r@{}}
    \\textbf{#1} & \\textbf{#2} \\\\
    \\textit{#3} & \\textit{#4} \\\\
  \\end{tabularx}
  \\vspace{-6pt}
}

\\newcommand{\\projectHeading}[2]{
  \\vspace{4pt}
  \\textbf{#1} \\textbar{} \\textit{#2}
  \\vspace{2pt}
}

\\newcommand{\\skillItem}[2]{
  \\textbf{#1:} #2\\\\
}

\\newcommand{\\educationItem}[1]{
  #1\\\\
}

\\newcommand{\\certItem}[1]{
  #1\\\\
}

\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{${esc(fullName)}}}\\\\
  \\vspace{2pt}
  ${esc(contactLine1)}\\\\
  ${esc(contactLine2)}\\\\
  \\vspace{2pt}
  \\textbf{${esc(headline)}}
\\end{center}

\\vspace{-4pt}

\\section{Summary}
${summaryText ? esc(summaryText) : 'AI/ML engineer with experience across AI workflow automation, LLM integrations, data pipelines, and production-oriented systems.'}

\\section{Professional Experience}
${buildExperience(experienceRaw) || '\\textit{Experience section unavailable due to formatting issue.}'}

\\section{Projects}
${buildProjects(projectsRaw) || '\\textit{Projects section unavailable due to formatting issue.}'}

\\section{Skills}
${buildSkills(skillsRaw) || '\\textit{Skills section unavailable due to formatting issue.}'}

\\section{Education}
${buildEducation(educationRaw)}

\\section{Certifications}
${buildCertifications(certsRaw)}

\\end{document}
`;

return {
  json: {
    latex,
    output: $json.output || '',
    company: $json.company || '',
    title: $json.title || '',
    jobLink: $json.jobLink || '',
    jobKey: $json.jobKey || '',
    postedAt: $json.postedAt || '',
    location: $json.location || '',
    employmentType: $json.employmentType || '',
    seniorityLevel: $json.seniorityLevel || '',
    jobDescription: $json.jobDescription || ''
  }
};