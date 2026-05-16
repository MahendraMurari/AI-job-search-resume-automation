# Scripts

This folder contains sanitized versions of the custom JavaScript logic used inside n8n Code nodes.

These scripts are not intended to run directly as a standalone application without n8n context. They are included to make the workflow logic easier to review, understand, and maintain.

## Files

### parse-apify-results.js

Cleans and normalizes job data from Apify results.

Responsibilities:
- strip HTML from job descriptions
- normalize LinkedIn job URLs
- extract job IDs when available
- create fallback duplicate keys
- skip weak or missing job descriptions
- deduplicate jobs inside the same run

### filter-duplicates.js

Checks Supabase to avoid processing the same job multiple times.

Responsibilities:
- query Supabase by job URL
- skip jobs already stored in the database
- return only new jobs for resume generation

### build-latex-resume.js

Converts structured LLM resume output into LaTeX.

Responsibilities:
- parse resume sections
- escape LaTeX special characters
- normalize problematic symbols
- format experience, projects, skills, education, and certifications
- generate an ATS-friendly LaTeX document

### prepare-pdf-metadata.js

Prepares safe metadata and PDF file names.

Responsibilities:
- sanitize company and role names
- create clean document titles
- preserve job metadata for downstream workflow steps

### email-summary.js

Builds the final HTML email summary.

Responsibilities:
- combine job metadata with Drive upload results
- generate a table of job links and resume links
- return one email item for the Gmail node